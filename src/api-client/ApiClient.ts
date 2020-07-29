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

import { normalizeResponse } from 'api-client/helpers'
import { hasPathStr, pathStr } from 'utils/fp'
import { prop, has, cond, T, identity, when } from 'ramda'
import { isPlainObject } from 'utils/misc'
import { IApiClient } from './model'
import ApiCache from './cache-client'

let _instance: ApiClient = null

interface ApiClientOptions {
  [key: string]: any
  keystoneEndpoint: string
}

class ApiClient implements IApiClient {
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
  public activeRegion
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

  static refreshApiEndpoints() {
    const instance = ApiClient.getInstance()
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

  constructor(options: ApiClientOptions) {
    this.options = options
    if (!options.keystoneEndpoint) {
      throw new Error('keystoneEndpoint required')
    }
    this.appbert = new Appbert(this)
    this.cinder = new Cinder(this)
    this.glance = new Glance(this)
    this.keystone = new Keystone(this)
    this.neutron = new Neutron(this)
    this.nova = new Nova(this)
    this.murano = new Murano(this)
    this.resmgr = new ResMgr(this)
    this.qbert = new Qbert(this)
    this.clemency = new Clemency(this)

    this.catalog = {}
    this.activeRegion = null

    const getResponseError: any = cond([
      [hasPathStr('response.data.error'), pathStr('response.data.error')],
      [hasPathStr('response.data.message'), pathStr('response.data.message')],
      [has('error'), when(isPlainObject, prop('error'))],
      [T, identity],
    ])

    this.axiosInstance = axios.create({ ...defaultAxiosConfig, ...(options.axios || {}) })
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => Promise.reject(getResponseError(error)),
    )
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

  rawGet = async <T>(clsName, mthdName, url, config = undefined) => {
    const response = await this.axiosInstance.get<T>(url, config)
    ApiCache.instance.cacheItem(clsName, mthdName, response)
    return response
  }

  rawPost = async <T>(clsName, mthdName, url, data, config = undefined) => {
    const response = await this.axiosInstance.post<T>(url, data, config)
    ApiCache.instance.cacheItem(clsName, mthdName, response)
    return response
  }

  rawPut = async <T>(clsName, mthdName, url, data, config = undefined) => {
    const response = await this.axiosInstance.put<T>(url, data, config)
    ApiCache.instance.cacheItem(clsName, mthdName, response)
    return response
  }

  rawPatch = async <T>(clsName, mthdName, url, data, config = undefined) => {
    const response = await this.axiosInstance.patch<T>(url, data, config)
    ApiCache.instance.cacheItem(clsName, mthdName, response)
    return response
  }

  rawDelete = async <T>(clsName, mthdName, url, config = undefined) => {
    const response = await this.axiosInstance.delete<T>(url, config)
    ApiCache.instance.cacheItem(clsName, mthdName, response)
    return response
  }

  basicGet = async <T>(clsName, mthdName, url, params = undefined) => {
    const response = await this.axiosInstance.get<T>(url, {
      params,
      ...this.getAuthHeaders(),
    })
    ApiCache.instance.cacheItem(clsName, mthdName, response)
    return normalizeResponse(response)
  }

  basicPost = async <T>(clsName, mthdName, url, body = undefined) => {
    const response = await this.axiosInstance.post<T>(url, body, this.getAuthHeaders())
    ApiCache.instance.cacheItem(clsName, mthdName, response)
    return normalizeResponse(response)
  }

  basicPatch = async <T>(clsName, mthdName, url, body = undefined) => {
    const response = await this.axiosInstance.patch<T>(url, body, this.getAuthHeaders())
    ApiCache.instance.cacheItem(clsName, mthdName, response)
    return normalizeResponse(response)
  }

  basicPut = async <T>(clsName, mthdName, url, body = undefined) => {
    const response = await this.axiosInstance.put<T>(url, body, this.getAuthHeaders())
    ApiCache.instance.cacheItem(clsName, mthdName, response)
    return normalizeResponse(response)
  }

  basicDelete = async <T>(clsName, mthdName, url) => {
    const response = await this.axiosInstance.delete<T>(url, this.getAuthHeaders())
    ApiCache.instance.cacheItem(clsName, mthdName, response)
    return normalizeResponse(response)
  }
}

export default ApiClient
