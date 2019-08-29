import axios from 'axios'

import Appbert from './Appbert'
import Cinder from './Cinder'
import Glance from './Glance'
import Keystone from './Keystone'
import Murano from './Murano'
import Neutron from './Neutron'
import Nova from './Nova'
import Qbert from './Qbert'
import ResMgr from './ResMgr'

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

  basicGet = async url => {
    const response = await axios.get(url, this.getAuthHeaders())
    return response.data
  }

  basicPost = async (url, body) => {
    const response = await axios.post(url, body, this.getAuthHeaders())
    return response.data
  }

  basicPatch = async (url, body) => {
    const config = this.getAuthHeaders()
    config.headers['Content-Type'] = 'application/json-patch+json'
    const response = await axios.patch(url, body, config)
    return response.data
  }

  basicPut = async (url, body) => {
    const response = await axios.put(url, body, this.getAuthHeaders())
    return response.data
  }

  basicDelete = async url => {
    const response = await axios.delete(url, this.getAuthHeaders())
    return response.data
  }
}

export default ApiClient
