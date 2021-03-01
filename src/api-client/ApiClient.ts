import axios, { AxiosInstance } from 'axios'
import { defaultAxiosConfig } from 'app/constants'

import Appbert from './Appbert'
import Cinder from './Cinder'
import Glance from './Glance'
import Keystone from './Keystone'
import Murano from './Murano'
import Neutron from './Neutron'
import Nova from './Nova'
import Qbert from './Qbert'
import ResMgr from './ResMgr'
import Clemency from 'api-client/Clemency'
import Helm from './Helm'
import Hagrid from './Hagrid'

import { ID } from './keystone.model'

import { normalizeResponse } from 'api-client/helpers'
import { hasPathStr, pathStr } from 'utils/fp'
import { prop, has, cond, T, identity, when } from 'ramda'
import { isPlainObject, pathJoin } from 'utils/misc'
// import { IApiClient } from './model'
// import ApiCache from './cache-client'
import {
  IRawRequestGetParams,
  IRawRequestPostParams,
  IBasicRequestGetParams,
  IBasicRequestPostParams,
  IBasicRequestDeleteParams,
} from './model'
import ApiService from 'api-client/ApiService'
import Bugsnag from '@bugsnag/js'
import { someAsync } from 'utils/async'

interface ApiClientOptions {
  [key: string]: any
  keystoneEndpoint: string
}

class ApiClient {
  public options: ApiClientOptions

  public appbert: Appbert
  public cinder: Cinder
  public glance: Glance
  public keystone: Keystone
  public neutron: Neutron
  public nova: Nova
  public murano: Murano
  public resMgr: ResMgr
  public qbert: Qbert
  public clemency: Clemency
  public helm: Helm
  public hagrid: Hagrid
  public catalog = {}
  public activeRegion: ID = null
  unscopedToken = null
  scopedToken = null
  activeProjectId = null
  serviceCatalog = null
  endpoints = null

  private readonly axiosInstance: AxiosInstance
  private static instance: ApiClient

  static init(options: ApiClientOptions) {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(options)
    }
    return ApiClient.instance
  }

  static getInstance() {
    if (!ApiClient.instance) {
      throw new Error(
        'ApiClient instance has not been initialized, please call ApiClient.init to instantiate it',
      )
    }
    return ApiClient.instance
  }

  static hydrate(state) {
    const options = {
      keystoneEndpoint: state.keystoneEndpoint,
    }
    const client = new ApiClient(options)
    client.catalog = state.catalog
    return client
  }

  static async refreshApiEndpoints(instance = ApiClient.getInstance()) {
    await someAsync([
      instance.keystone.initialize(),
      instance.cinder.initialize(),
      instance.glance.initialize(),
      instance.appbert.initialize(),
      instance.neutron.initialize(),
      instance.nova.initialize(),
      instance.murano.initialize(),
      instance.resMgr.initialize(),
      instance.qbert.initialize(),
      instance.clemency.initialize(),
      instance.helm.initialize(),
      instance.hagrid.initialize(),
    ])
  }

  apiServices = {}

  constructor(options: ApiClientOptions) {
    this.options = options
    if (!options.keystoneEndpoint) {
      throw new Error('keystoneEndpoint required')
    }
    const getResponseError: any = (cond as any)([
      [hasPathStr('response.data.error'), pathStr('response.data.error')],
      [hasPathStr('response.data.message'), pathStr('response.data.message')],
      [has('error'), when<any, string>(isPlainObject, prop('error'))],
      [T, identity],
    ])

    this.axiosInstance = axios.create({ ...defaultAxiosConfig, ...(options.axios || {}) })
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const url = error?.response?.config
        const data = error?.response?.data

        Bugsnag.addMetadata('Api Url', url)
        Bugsnag.addMetadata('Api Response', data)
        Bugsnag.notify(error)

        return Promise.reject(getResponseError(error))
      },
    )

    // Keystone is used by all the other services so it must be initialized first
    this.keystone = this.addApiService(new Keystone(this))
    this.cinder = this.addApiService(new Cinder(this))
    this.glance = this.addApiService(new Glance(this))
    this.appbert = this.addApiService(new Appbert(this))
    this.neutron = this.addApiService(new Neutron(this))
    this.nova = this.addApiService(new Nova(this))
    this.murano = this.addApiService(new Murano(this))
    this.resMgr = this.addApiService(new ResMgr(this))
    this.qbert = this.addApiService(new Qbert(this))
    this.clemency = this.addApiService(new Clemency(this))
    this.helm = this.addApiService(new Helm(this))
    this.hagrid = this.addApiService(new Hagrid(this))
  }

  addApiService = <T extends ApiService>(apiClientInstance: T) => {
    this.apiServices[apiClientInstance.getClassName()] = apiClientInstance
    return apiClientInstance
  }

  serialize = () => {
    return {
      keystoneEndpoint: this.options.keystoneEndpoint,
      unscopedToken: this.unscopedToken,
      scopedToken: this.scopedToken,
      catalog: this.catalog,
      activeProjectId: this.activeProjectId,
    }
  }

  setActiveRegion = (regionId) => {
    this.activeRegion = regionId
  }

  getAuthHeaders = (scoped = true) => {
    const token = scoped ? this.scopedToken : this.unscopedToken
    if (!token) {
      console.warn('Auth token not initialized')
      return {}
    }
    // It's not necessary to send both headers but it's easier since we don't
    // need to pass around the url and have conditional logic.
    // Both APIs will ignore any headers they don't understand.
    const headers = {
      Authorization: `Bearer ${token}`, // required for k8s proxy api
      'X-Auth-Token': token, // required for OpenStack
    }
    return { headers }
  }

  async getEndpoint({ version, endpoint, clsName }) {
    if (endpoint === undefined) {
      endpoint = await this.apiServices[clsName].getApiEndpoint()
    }
    if (version !== undefined) {
      return endpoint.replace(/\/v3$/, `/${version}`).replace(/\/v3\//, `/${version}/`)
    }
    return endpoint
  }

  rawGet = async <T extends any>({
    url,
    version,
    endpoint = undefined,
    config = undefined,
    options: { clsName, mthdName },
  }: IRawRequestGetParams) => {
    endpoint = await this.getEndpoint({ endpoint, version, clsName })

    const response = await this.axiosInstance.get<T>(pathJoin(endpoint, url), config)
    // ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return response
  }

  rawPost = async <T extends any>({
    url,
    version,
    data,
    endpoint = undefined,
    config = undefined,
    options: { clsName, mthdName },
  }: IRawRequestPostParams) => {
    endpoint = await this.getEndpoint({ endpoint, version, clsName })
    const response = await this.axiosInstance.post<T>(pathJoin(endpoint, url), data, config)
    // ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return response
  }

  rawPut = async <T extends any>({
    url,
    version,
    data,
    endpoint = undefined,
    config = undefined,
    options: { clsName, mthdName },
  }: IRawRequestPostParams) => {
    endpoint = await this.getEndpoint({ endpoint, version, clsName })
    const response = await this.axiosInstance.put<T>(pathJoin(endpoint, url), data, config)
    // ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return response
  }

  rawPatch = async <T extends any>({
    url,
    version,
    data,
    endpoint = undefined,
    config = undefined,
    options: { clsName, mthdName },
  }: IRawRequestPostParams) => {
    endpoint = await this.getEndpoint({ endpoint, version, clsName })
    const response = await this.axiosInstance.patch<T>(pathJoin(endpoint, url), data, config)
    // ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return response
  }

  rawDelete = async <T extends any>({
    url,
    version,
    endpoint = undefined,
    config = undefined,
    options: { clsName, mthdName },
  }: IRawRequestGetParams) => {
    endpoint = await this.getEndpoint({ endpoint, version, clsName })
    const response = await this.axiosInstance.delete<T>(pathJoin(endpoint, url), config)
    // ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return response
  }

  basicGet = async <T extends any>({
    url,
    version,
    endpoint = undefined,
    params = undefined,
    options: { clsName, mthdName },
  }: IBasicRequestGetParams) => {
    endpoint = await this.getEndpoint({ endpoint, version, clsName })
    const response = await this.axiosInstance.get<T>(pathJoin(endpoint, url), {
      params,
      ...this.getAuthHeaders(),
    })
    // ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return normalizeResponse<T>(response)
  }

  basicPost = async <T extends any>({
    url,
    version,
    endpoint = undefined,
    body = undefined,
    options: { clsName, mthdName },
  }: IBasicRequestPostParams) => {
    endpoint = await this.getEndpoint({ endpoint, version, clsName })
    const response = await this.axiosInstance.post<T>(
      pathJoin(endpoint, url),
      body,
      this.getAuthHeaders(),
    )
    // ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return normalizeResponse<T>(response)
  }

  basicPatch = async <T extends any>({
    url,
    version,
    endpoint = undefined,
    body = undefined,
    options: { clsName, mthdName },
  }: IBasicRequestPostParams) => {
    endpoint = await this.getEndpoint({ endpoint, version, clsName })
    const response = await this.axiosInstance.patch<T>(
      pathJoin(endpoint, url),
      body,
      this.getAuthHeaders(),
    )
    // ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return normalizeResponse<T>(response)
  }

  basicPut = async <T extends any>({
    url,
    version,
    endpoint = undefined,
    body = undefined,
    options: { clsName, mthdName },
  }: IBasicRequestPostParams) => {
    endpoint = await this.getEndpoint({ endpoint, version, clsName })
    const response = await this.axiosInstance.put<T>(
      pathJoin(endpoint, url),
      body,
      this.getAuthHeaders(),
    )
    // ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return normalizeResponse<T>(response)
  }

  basicDelete = async <T extends any>({
    url,
    version,
    endpoint = undefined,
    options: { clsName, mthdName },
    data = undefined,
  }: IBasicRequestDeleteParams) => {
    endpoint = await this.getEndpoint({ endpoint, version, clsName })
    const response = await this.axiosInstance.delete<T>(pathJoin(endpoint, url), {
      ...this.getAuthHeaders(),
      data,
    })
    // ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return normalizeResponse<T>(response)
  }
}

export default ApiClient
