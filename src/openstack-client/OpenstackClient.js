import Keystone from './Keystone'

class OpenstackClient {
  constructor (options = {}) {
    this.options = options
    if (!options.keystoneEndpoint) {
      throw new Error('keystoneEndpoint required')
    }
    this.keystone = new Keystone(this)
    this.catalog = {}
  }

  serialize () {
    return {
      keystoneEndpoint: this.options.keystoneEndpoint,
      unscopedToken: this.unscopedToken,
      scopedToken: this.scopedToken,
      catalog: this.catalog,
    }
  }

  static hydrate (state) {
    const options = {
      keystoneEndpoint: state.keystoneEndpoint
    }
    const client = new OpenstackClient(options)
    client.catalog = state.catalog
    return client
  }
}

export default OpenstackClient
