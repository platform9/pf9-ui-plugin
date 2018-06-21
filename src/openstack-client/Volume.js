import axios from 'axios'

class Volume {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.cinderv3.admin.url
    return endpoint
  }

  volumesUrl = async () => `${await this.endpoint()}/volumes`

  async getVolume (id) {
    const url = `${await this.volumesUrl()}/${id}`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.volume
  }

  // Get volumes with details
  async getVolumes () {
    const url = `${await this.volumesUrl()}/detail`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.volumes
  }

  async createVolume (params) {
    const url = await this.volumesUrl()
    try {
      const response = await axios.post(url, { volume: params }, this.client.getAuthHeaders())
      return response.data.volume
    } catch (err) {
      console.log(err)
    }
  }

  async deleteVolume (id) {
    const url = `${await this.volumesUrl()}/${id}`
    try {
      const response = await axios.delete(url, this.client.getAuthHeaders())
      return response
    } catch (err) {
      console.log(err)
    }
  }

  async updateVolume (id, params) {
    const url = `${await this.volumesUrl()}/${id}`
    try {
      const response = await axios.put(url, { volume: params }, this.client.getAuthHeaders())
      return response.data.volume
    } catch (err) {
      console.log(err)
    }
  }
}

export default Volume
