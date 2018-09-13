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
  hypervisorsUrl = async () => `${await this.endpoint()}/os-hypervisors`

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

  async getHypervisors () {
    const url = `${await this.hypervisorsUrl()}/detail`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.hypervisors
  }
}

export default Nova
