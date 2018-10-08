import axios from 'axios'

class Murano {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.murano.internal.url
    return endpoint
  }

  v1 = async () => `${await this.endpoint()}/v1`

  applicationUrl = async () => `${await this.v1()}/catalog/packages`

  uploadUrl = async () => `${await this.v1()}/catalog/packagesHot`

  async getApplications () {
    const url = await this.applicationUrl()
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.packages
  }

  async getApplication (id) {
    const url = `${await this.applicationUrl()}/${id}`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.package
    } catch (err) {
      console.log(err)
    }
  }

  async uploadApplications (params) {
    const url = await this.uploadUrl()
    try {
      const response = await axios.post(url, params, this.client.getAuthHeaders())
      return response.data
    } catch (err) {
      console.log(err)
    }
  }

  async deleteApplication (id) {
    const url = `${await this.applicationUrl()}/${id}`
    try {
      const response = await axios.delete(url, this.client.getAuthHeaders())
      return response
    } catch (err) {
      console.log(err)
    }
  }

  async updateApplication (id, params) {
    const url = `${await this.applicationUrl()}/${id}`
    try {
      const response = await axios.put(url, { package: params }, this.client.getAuthHeaders())
      return response.data.package
    } catch (err) {
      console.log(err)
    }
  }
}

export default Murano
