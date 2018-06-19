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
      const response = await axios.post(url, {volume: params}, this.client.getAuthHeaders())
      return response.data.volume
    } catch (err) {
      console.log(err)
    }
  }

  async deleteVolume (id) {
    const url = `${await this.imagesUrl()}/${id}`
    const response = await axios.delete(url, this.client.getAuthHeaders())
    return response
  }
}

export default Volume
