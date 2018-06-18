import axios from 'axios'

class Volume {
  constructor (client) {
    this.client = client
  }

  baseUrl = 'cinderv3'

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services[this.baseUrl].admin.url
    return endpoint
  }

  volumesUrl = async () => `${await this.endpoint()}/volumes`

  async getVolumes () {
    const url = await this.volumesUrl()
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.volumes
  }

  async createVolume (params) {
    const url = await this.volumesUrl()
    try {
      const response = await axios.post(url, params, this.client.getAuthHeaders())
      return response.data
    } catch (err) {
      console.err(err)
    }
  }
}

export default Volume
