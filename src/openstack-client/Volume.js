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

  async getVolumes () {
    const url = await this.volumesUrl()
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

  async waitForCreate (delay, maxRetries, id) {
    const url = `${await this.volumesUrl()}/${id}`
    let response = await axios.get(url, this.client.getAuthHeaders())
    let flag = (response.data.volume.status === 'available')
    if (!flag) {
      let retries = 0
      for (; retries <= maxRetries && !flag; retries++) {
        await sleep(delay)
        response = await axios.get(url, this.client.getAuthHeaders())
        flag = (response.data.volume.status === 'available')
      }
      if (retries > maxRetries) {
        throw new Error('Creation did not finish within set time.')
      }
    }
    return flag
  }

  async waitForDelete (delay, maxRetries, id) {
    const url = await this.volumesUrl()
    let response = await axios.get(url, this.client.getAuthHeaders())
    let flag = (response.data.volumes.find(x => x.id === id) === undefined)
    if (!flag) {
      let retries = 0
      for (; retries <= maxRetries && !flag; retries++) {
        await sleep(delay)
        response = await axios.get(url, this.client.getAuthHeaders())
        flag = (response.data.volumes.find(x => x.id === id) === undefined)
      }
      if (retries > maxRetries) {
        throw new Error('Deletion did not finish within set time.')
      }
    }
    return flag
  }
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export default Volume
