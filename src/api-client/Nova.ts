import axios from 'axios'
import ApiService from 'api-client/ApiService'

// Returns a transducer function instead being passed the obj directly
// so it can be used in Array#map/filter/etc as well.
const renameKey = (srcKey, destKey) => obj => Object.keys(obj).reduce(
  (accum, key) => ({ ...accum, [key === srcKey ? destKey : key]: obj[key] }),
  {}
)

class Nova extends ApiService {
  endpoint () {
    return this.client.keystone.getServiceEndpoint('nova', 'internal')
  }

  flavorsUrl = async () => `${await this.endpoint()}/flavors`
  instancesUrl = async () => `${await this.endpoint()}/servers`
  hypervisorsUrl = async () => `${await this.endpoint()}/os-hypervisors`
  sshKeysUrl = async () => `${await this.endpoint()}/os-keypairs`

  getFlavors = async () => {
    const url = `${await this.flavorsUrl()}/detail?is_public=no`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.flavors
  }

  createFlavor = async (params) => {
    // The Nova API has an unfortunately horribly named key for public.
    const converted = renameKey('public', 'os-flavor-access:is_public')(params)
    const body = { flavor: converted }
    const url = await this.flavorsUrl()
    const response = await axios.post(url, body, this.client.getAuthHeaders())
    return response.data.flavor
  }

  deleteFlavor = async (id) => {
    const url = `${await this.flavorsUrl()}/${id}`
    return axios.delete(url, this.client.getAuthHeaders())
  }

  // Allow these methods to be accessed programatically as well.
  flavors = {
    create: this.createFlavor.bind(this),
    list: this.getFlavors.bind(this),
    delete: this.deleteFlavor.bind(this),
  }

  async getInstances () {
    const url = `${await this.instancesUrl()}/detail`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.servers.map(instance => renameKey('OS-EXT-STS:vm_state', 'state')(instance))
  }

  async getHypervisors () {
    const url = `${await this.hypervisorsUrl()}/detail`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.hypervisors
  }

  async getSshKeys () {
    const url = `${await this.sshKeysUrl()}`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.keypairs.map(x => x.keypair)
  }

  async createSshKey (params) {
    const url = await this.sshKeysUrl()
    const response = await axios.post(url, { keypair: params }, this.client.getAuthHeaders())
    return response.data.keypair
  }

  async deleteSshKey (id) {
    const url = `${await this.sshKeysUrl()}/${id}`
    return axios.delete(url, this.client.getAuthHeaders())
  }
}

export default Nova
