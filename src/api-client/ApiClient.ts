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

import { ID } from './keystone.model'

import { normalizeResponse } from 'api-client/helpers'
import { hasPathStr, pathStr } from 'utils/fp'
import { prop, has, cond, T, identity, when } from 'ramda'
import { isPlainObject, pathJoin } from 'utils/misc'
// import { IApiClient } from './model'
import ApiCache from './cache-client'
import {
  IRawRequestGetParams,
  IRawRequestPostParams,
  IBasicRequestGetParams,
  IBasicRequestPostParams,
} from './model'

let _instance: ApiClient = null

interface ApiClientOptions {
  [key: string]: any
  keystoneEndpoint: string
}

class ApiClient {
  public options: ApiClientOptions

  public instance: ApiClient
  public appbert: Appbert
  public cinder: Cinder
  public glance: Glance
  public keystone: Keystone
  public neutron: Neutron
  public nova: Nova
  public murano: Murano
  public resmgr: ResMgr
  public qbert: Qbert
  public clemency: Clemency
  public catalog = null
  public activeRegion: ID
  unscopedToken = null
  scopedToken = null
  activeProjectId = null
  serviceCatalog = null
  endpoints = null

  private readonly axiosInstance: AxiosInstance

  static init(options: ApiClientOptions) {
    _instance = new ApiClient(options)
    return _instance
  }

  static getInstance() {
    if (!_instance) {
      throw new Error(
        'ApiClient instance has not been initialized, please call ApiClient.init to instantiate it',
      )
    }
    return _instance
  }

  static hydrate(state) {
    const options = {
      keystoneEndpoint: state.keystoneEndpoint,
    }
    const client = new ApiClient(options)
    client.catalog = state.catalog
    return client
  }

  static refreshApiEndpoints(instance = ApiClient.getInstance()) {
    instance.appbert.initialize()
    instance.cinder.initialize()
    instance.glance.initialize()
    instance.keystone.initialize()
    instance.neutron.initialize()
    instance.nova.initialize()
    instance.murano.initialize()
    instance.resmgr.initialize()
    instance.qbert.initialize()
    instance.clemency.initialize()
  }

  clientsByName = {}

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
      async (error) => Promise.reject(getResponseError(error)),
    )

    // Keystone is used by the rest of the services so it must be initialized first

    this.keystone = new Keystone(this)
    this.cinder = new Cinder(this)
    this.glance = new Glance(this)
    this.appbert = new Appbert(this)
    this.neutron = new Neutron(this)
    this.nova = new Nova(this)
    this.murano = new Murano(this)
    this.resmgr = new ResMgr(this)
    this.qbert = new Qbert(this)
    this.clemency = new Clemency(this)

    this.clientsByName = {
      [this.keystone.getClassName()]: this.keystone,
      [this.cinder.getClassName()]: this.cinder,
      [this.glance.getClassName()]: this.glance,
      [this.appbert.getClassName()]: this.appbert,
      [this.neutron.getClassName()]: this.neutron,
      [this.nova.getClassName()]: this.nova,
      [this.murano.getClassName()]: this.murano,
      [this.resmgr.getClassName()]: this.resmgr,
      [this.qbert.getClassName()]: this.qbert,
      [this.clemency.getClassName()]: this.clemency,
    }

    this.catalog = {}
    this.activeRegion = null

    // ApiClient.refreshApiEndpoints(this)
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
    // It's not necessary to send both headers but it's easier since we don't
    // need to pass around the url and have conditional logic.
    // Both APIs will ignore any headers they don't understand.
    const headers = {
      Authorization: `Bearer ${token}`, // required for k8s proxy api
      'X-Auth-Token': token, // required for OpenStack
    }
    return { headers }
  }

  rawGet = async <T extends any>({
    url,
    endpoint = undefined,
    config = undefined,
    options: { clsName, mthdName },
  }: IRawRequestGetParams) => {
    if (!endpoint) {
      endpoint = await this.clientsByName[clsName].getApiEndpoint()
    }
    const response = await this.axiosInstance.get<T>(pathJoin(endpoint, url), config)
    ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return response
  }

  rawPost = async <T extends any>({
    url,
    data,
    endpoint = undefined,
    config = undefined,
    options: { clsName, mthdName },
  }: IRawRequestPostParams) => {
    if (!endpoint) {
      endpoint = await this.clientsByName[clsName].getApiEndpoint()
    }
    const response = await this.axiosInstance.post<T>(pathJoin(endpoint, url), data, config)
    ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return response
  }

  rawPut = async <T extends any>({
    url,
    data,
    endpoint = undefined,
    config = undefined,
    options: { clsName, mthdName },
  }: IRawRequestPostParams) => {
    if (!endpoint) {
      endpoint = await this.clientsByName[clsName].getApiEndpoint()
    }
    const response = await this.axiosInstance.put<T>(pathJoin(endpoint, url), data, config)
    ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return response
  }

  rawPatch = async <T extends any>({
    url,
    data,
    endpoint = undefined,
    config = undefined,
    options: { clsName, mthdName },
  }: IRawRequestPostParams) => {
    if (!endpoint) {
      endpoint = await this.clientsByName[clsName].getApiEndpoint()
    }
    const response = await this.axiosInstance.patch<T>(pathJoin(endpoint, url), data, config)
    ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return response
  }

  rawDelete = async <T extends any>({
    url,
    endpoint = undefined,
    config = undefined,
    options: { clsName, mthdName },
  }: IRawRequestGetParams) => {
    if (!endpoint) {
      endpoint = await this.clientsByName[clsName].getApiEndpoint()
    }
    const response = await this.axiosInstance.delete<T>(pathJoin(endpoint, url), config)
    ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return response
  }

  basicGet = async <T extends any>({
    url,
    endpoint = undefined,
    params = undefined,
    options: { clsName, mthdName },
  }: IBasicRequestGetParams) => {
    if (!endpoint) {
      endpoint = await this.clientsByName[clsName].getApiEndpoint()
    }
    const response = await this.axiosInstance.get<T>(pathJoin(endpoint, url), {
      params,
      ...this.getAuthHeaders(),
    })
    ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return normalizeResponse<T>(response)
  }

  basicPost = async <T extends any>({
    url,
    endpoint = undefined,
    body = undefined,
    options: { clsName, mthdName },
  }: IBasicRequestPostParams) => {
    if (!endpoint) {
      endpoint = await this.clientsByName[clsName].getApiEndpoint()
    }
    const response = await this.axiosInstance.post<T>(
      pathJoin(endpoint, url),
      body,
      this.getAuthHeaders(),
    )
    ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return normalizeResponse<T>(response)
  }

  basicPatch = async <T extends any>({
    url,
    endpoint = undefined,
    body = undefined,
    options: { clsName, mthdName },
  }: IBasicRequestPostParams) => {
    if (!endpoint) {
      endpoint = await this.clientsByName[clsName].getApiEndpoint()
    }
    const response = await this.axiosInstance.patch<T>(
      pathJoin(endpoint, url),
      body,
      this.getAuthHeaders(),
    )
    ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return normalizeResponse<T>(response)
  }

  basicPut = async <T extends any>({
    url,
    endpoint = undefined,
    body = undefined,
    options: { clsName, mthdName },
  }: IBasicRequestPostParams) => {
    if (!endpoint) {
      endpoint = await this.clientsByName[clsName].getApiEndpoint()
    }
    const response = await this.axiosInstance.put<T>(
      pathJoin(endpoint, url),
      body,
      this.getAuthHeaders(),
    )
    ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return normalizeResponse<T>(response)
  }

  basicDelete = async <T extends any>({
    url,
    endpoint = undefined,
    options: { clsName, mthdName },
  }: IBasicRequestGetParams) => {
    if (!endpoint) {
      endpoint = await this.clientsByName[clsName].getApiEndpoint()
    }
    const response = await this.axiosInstance.delete<T>(
      pathJoin(endpoint, url),
      this.getAuthHeaders(),
    )
    ApiCache.instance.cacheItem(clsName, mthdName, response.data)
    return normalizeResponse<T>(response)
  }
}

export default ApiClient
