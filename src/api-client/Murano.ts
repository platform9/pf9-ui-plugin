import ApiService from 'api-client/ApiService'

class Murano extends ApiService {
  clsName = 'murano'
  async endpoint() {
    return this.client.keystone.getServiceEndpoint('murano', 'internal')
  }

  v1 = async () => `${await this.endpoint()}/v1`

  applicationUrl = async () => `${await this.v1()}/catalog/packages`

  uploadUrl = async () => `${await this.v1()}/catalog/packagesHot`

  async getApplications() {
    const url = await this.applicationUrl()
    const response = await this.client.basicGet('Murano', 'getApplications', url)
    return response.packages
  }

  async getApplication(id) {
    const url = `${await this.applicationUrl()}/${id}`
    try {
      const response = await this.client.basicGet('Murano', 'getApplication', url)
      return response.package
    } catch (err) {
      console.log(err)
    }
  }

  async uploadApplications(params) {
    const url = await this.uploadUrl()
    try {
      const response = await this.client.basicPost('Murano', 'uploadApplications', url, params)
      return response
    } catch (err) {
      console.log(err)
    }
  }

  async deleteApplication(id) {
    const url = `${await this.applicationUrl()}/${id}`
    try {
      return await this.client.basicDelete('Murano', 'deleteApplication', url)
    } catch (err) {
      console.log(err)
    }
  }

  async updateApplication(id, params) {
    const url = `${await this.applicationUrl()}/${id}`
    try {
      const response = await this.client.basicPut('Murano', 'updateApplication', url, {
        package: params,
      })
      return response.package
    } catch (err) {
      console.log(err)
    }
  }
}

export default Murano
