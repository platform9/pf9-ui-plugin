import axios from 'axios'
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
import { normalizeResponse } from 'api-client/helpers'
import { hasPathStr, pathStr } from 'utils/fp'
import { prop, has, cond, T, identity } from 'ramda'

class ApiClient {
  static init (options = {}) {
    this.instance = new this(options)
    return this.instance
  }

  static getInstance () {
    const { instance } = this
    if (!instance) {
      throw new Error('ApiClient instance has not been initialized, please call ApiClient.init to instantiate it')
    }
    return instance
  }

  static hydrate (state) {
    const options = {
      keystoneEndpoint: state.keystoneEndpoint,
    }
    const client = new ApiClient(options)
    client.catalog = state.catalog
    return client
  }

  constructor (options = {}) {
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

    this.catalog = {}
    this.activeRegion = null

    const getResponseError = cond([
      [hasPathStr('response.data.error'), pathStr('response.data.error')],
      [hasPathStr('response.data.message'), pathStr('response.data.message')],
      [has('error'), prop('error')],
      [T, identity],
    ])

    this.axiosInstance = axios.create({ ...defaultAxiosConfig, ...(options.axios || {}) })
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => Promise.reject(getResponseError(error)),
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

  setActiveRegion = regionId => {
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

  rawGet = (url, config) => this.axiosInstance.get(url, config)

  rawPost = (url, data, config) => this.axiosInstance.post(url, data, config)

  rawPut = (url, data, config) => this.axiosInstance.put(url, data, config)

  rawPatch = (url, data, config) => this.axiosInstance.patch(url, data, config)

  rawDelete = (url, config) => this.axiosInstance.delete(url, config)

  basicGet = async (url, params) => {
    const response = await this.axiosInstance.get(url, {
      params,
      ...this.getAuthHeaders(),
    })
    return normalizeResponse(response)
  }

  basicPost = async (url, body) => {
    const response = await this.axiosInstance.post(url, body, this.getAuthHeaders())
    return normalizeResponse(response)
  }

  basicPatch = async (url, body) => {
    const config = this.getAuthHeaders()
    config.headers['Content-Type'] = 'application/json-patch+json'
    const response = await this.axiosInstance.patch(url, body, config)
    return normalizeResponse(response)
  }

  basicPut = async (url, body) => {
    const response = await this.axiosInstance.put(url, body, this.getAuthHeaders())
    return normalizeResponse(response)
  }

  basicDelete = async url => {
    const response = await this.axiosInstance.delete(url, this.getAuthHeaders())
    return normalizeResponse(response)
  }
}

export default ApiClient
