import ApiService from 'api-client/ApiService'
import DataKeys from 'k8s/DataKeys'
import { trackApiMethodMetadata } from './helpers'

// Returns a transducer function instead being passed the obj directly
// so it can be used in Array#map/filter/etc as well.
const renameKey = (srcKey, destKey) => (obj) =>
  Object.keys(obj).reduce(
    (accum, key) => ({ ...accum, [key === srcKey ? destKey : key]: obj[key] }),
    {},
  )

class Nova extends ApiService {
  public getClassName() {
    return 'nova'
  }

  protected async getEndpoint() {
    return this.client.keystone.getServiceEndpoint('nova', 'internal')
  }

  flavorsUrl = () => `/flavors`
  instancesUrl = () => `/servers`
  hypervisorsUrl = () => `/os-hypervisors`
  sshKeysUrl = () => `/os-keypairs`

  @trackApiMethodMetadata({ url: '/flavors/detail?is_public=no', type: 'GET' })
  getFlavors = async () => {
    const url = `${this.flavorsUrl()}/detail?is_public=no`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getFlavors',
      },
    })
    return response.flavors
  }

  createFlavor = async (params) => {
    // The Nova API has an unfortunately horribly named key for public.
    const converted = renameKey('public', 'os-flavor-access:is_public')(params)
    const body = { flavor: converted }
    const url = this.flavorsUrl()
    const response = await this.client.basicPost<any>({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createFlavor',
      },
    })
    return response.flavor
  }

  deleteFlavor = async (id) => {
    const url = `${this.flavorsUrl()}/${id}`
    return this.client.basicDelete<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteFlavor',
      },
    })
  };

  // Allow these methods to be accessed programatically as well.
  [DataKeys.Flavors] = {
    create: this.createFlavor.bind(this),
    list: this.getFlavors.bind(this),
    delete: this.deleteFlavor.bind(this),
  }

  @trackApiMethodMetadata({ url: '/servers/detail', type: 'GET' })
  async getInstances() {
    const url = `${this.instancesUrl()}/detail`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getInstances',
      },
    })
    return response.servers.map((instance) => renameKey('OS-EXT-STS:vm_state', 'state')(instance))
  }

  @trackApiMethodMetadata({ url: '/os-hypervisors/detail', type: 'GET' })
  async getHypervisors() {
    const url = `${this.hypervisorsUrl()}/detail`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getHypervisors',
      },
    })
    return response.hypervisors
  }

  @trackApiMethodMetadata({ url: '/os-keypairs', type: 'GET' })
  async getSshKeys() {
    const url = `${this.sshKeysUrl()}`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getSshKeys',
      },
    })
    return response.keypairs.map((x) => x.keypair)
  }

  async createSshKey(params) {
    const url = this.sshKeysUrl()
    const response = await this.client.basicPost<any>({
      url,
      body: {
        keypair: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'createSshKey',
      },
    })
    return response.keypair
  }

  async deleteSshKey(id) {
    const url = `${this.sshKeysUrl()}/${id}`
    return this.client.basicDelete<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteSshKey',
      },
    })
  }
}

export default Nova
