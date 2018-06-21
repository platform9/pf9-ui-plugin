import axios from 'axios'

class Network {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.neutron.admin.url
    return endpoint
  }

  networkUrl = async () => `${await this.endpoint()}/v2.0/networks`

  async getNetwork (id) {
    const url = `${await this.networkUrl()}/${id}`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.network
  }

  async getNetworks () {
    const url = await this.networkUrl()
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.networks
  }

  async createNetwork (params) {
    const url = await this.networkUrl()
    try {
      const response = await axios.post(url, { network: params }, this.client.getAuthHeaders())
      return response.data.network
    } catch (err) {
      console.log(err)
    }
  }

  async deleteNetwork (id) {
    const url = `${await this.networkUrl()}/${id}`
    try {
      const response = await axios.delete(url, this.client.getAuthHeaders())
      return response.data.network
    } catch (err) {
      console.log(err)
    }
  }

  async updateNetwork (id, params) {
    const url = `${await this.networkUrl()}/${id}`
    try {
      const response = await axios.put(url, { network: params }, this.client.getAuthHeaders())
      return response.data.network
    } catch (err) {
      console.log(err)
    }
  }
}

export default Network
