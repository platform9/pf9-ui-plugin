import Keystone from './Keystone'
import Glance from './Glance'
import Volume from './Volume'

class OpenstackClient {
  constructor (options = {}) {
    this.options = options
    if (!options.keystoneEndpoint) {
      throw new Error('keystoneEndpoint required')
    }
    this.keystone = new Keystone(this)
    this.glance = new Glance(this)
    this.volume = new Volume(this)
    this.catalog = {}
    this.activeRegion = null
  }

  serialize () {
    return {
      keystoneEndpoint: this.options.keystoneEndpoint,
      unscopedToken: this.unscopedToken,
      scopedToken: this.scopedToken,
      catalog: this.catalog,
    }
  }

  setActiveRegion (regionId) {
    this.activeRegion = regionId
  }

  static hydrate (state) {
    const options = {
      keystoneEndpoint: state.keystoneEndpoint
    }
    const client = new OpenstackClient(options)
    client.catalog = state.catalog
    return client
  }

  getAuthHeaders (scoped = true) {
    const token = scoped ? this.scopedToken : this.unscopedToken
    if (!token) {
      return { headers: {} }
    }
    return ({
      headers: {
        'X-Auth-Token': token
      }
    })
  }
}

export default OpenstackClient
