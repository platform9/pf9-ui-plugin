import axios from 'axios'

// Returns a transducer function instead being passed the obj directly
// so it can be used in Array#map/filter/etc as well.
const renameKey = (srcKey, destKey) => obj => Object.keys(obj).reduce(
  (accum, key) => ({...accum, [key === srcKey ? destKey : key]: obj[key]}),
  {}
)

class Nova {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.nova.internal.url
    return endpoint
  }

  flavorsUrl = async () => `${await this.endpoint()}/flavors`
  instancesUrl = async () => `${await this.endpoint()}/servers`
  hypervisorsUrl = async () => `${await this.endpoint()}/os-hypervisors`
  sshKeysUrl = async () => `${await this.endpoint()}/os-keypairs`

  async getFlavors () {
    const url = `${await this.flavorsUrl()}/detail`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.flavors
  }

  async createFlavor (params) {
    // The Nova API has an unfortunately horribly named key for public.
    const converted = renameKey('public', 'os-flavor-access:is_public')(params)
    const body = { flavor: converted }
    const url = await this.flavorsUrl()
    const response = await axios.post(url, body, this.client.getAuthHeaders())
    return response.data.flavor
  }

  async deleteFlavor (id) {
    const url = `${await this.flavorsUrl()}/${id}`
    const response = await axios.delete(url, this.client.getAuthHeaders())
    return response
  }

  async getInstances () {
    const url = `${await this.instancesUrl()}/detail`
    const response = await axios.get(url, this.client.getAuthHeaders())
    const servers = response.data.servers.map(instance => renameKey('OS-EXT-STS:vm_state', 'state')(instance))
    return servers
  }

  async getHypervisors () {
    const url = `${await this.hypervisorsUrl()}/detail`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.hypervisors
  }

  async getSshKeys () {
    const url = `${await this.sshKeysUrl()}`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.keypairs
  }

  async createSshKey (params) {
    const url = await this.sshKeysUrl()
    const response = await axios.post(url, params, this.client.getAuthHeaders())
    return response.data
  }

  async deleteSshKey (id) {
    const url = `${await this.sshKeysUrl()}/${id}`
    const response = await axios.delete(url, this.client.getAuthHeaders())
    return response
  }
}

export default Nova
