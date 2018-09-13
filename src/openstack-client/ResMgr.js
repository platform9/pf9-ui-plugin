import axios from 'axios'

class ResMgr {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.resmgr.internal.url
    const v1Endpoint = `${endpoint}/v1`
    return v1Endpoint
  }

  async getHosts () {
    const url = `${await this.endpoint()}/hosts`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data
  }

  async unauthorizeHost (id) {
    const url = `${await this.endpoint()}/hosts/${id}`
    const response = await axios.delete(url, this.client.getAuthHeaders())
    return response
  }
}

export default ResMgr
