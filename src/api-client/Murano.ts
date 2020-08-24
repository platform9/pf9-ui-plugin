import ApiService from 'api-client/ApiService'

class Murano extends ApiService {
  public getClassName() {
    return 'murano'
  }

  protected async getEndpoint() {
    return this.client.keystone.getServiceEndpoint('murano', 'internal')
  }

  v1 = async () => `${await this.getEndpoint()}/v1`

  applicationUrl = async () => `${await this.v1()}/catalog/packages`

  uploadUrl = async () => `${await this.v1()}/catalog/packagesHot`

  async getApplications() {
    const url = await this.applicationUrl()
    const response = await this.client.basicGet<any>('Murano', 'getApplications', url)
    return response.packages
  }

  async getApplication(id) {
    const url = `${await this.applicationUrl()}/${id}`
    try {
      const response = await this.client.basicGet<any>('Murano', 'getApplication', url)
      return response.package
    } catch (err) {
      console.log(err)
    }
  }

  async uploadApplications(params) {
    const url = await this.uploadUrl()
    try {
      const response = await this.client.basicPost<any>('Murano', 'uploadApplications', url, params)
      return response
    } catch (err) {
      console.log(err)
    }
  }

  async deleteApplication(id) {
    const url = `${await this.applicationUrl()}/${id}`
    try {
      return await this.client.basicDelete<any>('Murano', 'deleteApplication', url)
    } catch (err) {
      console.log(err)
    }
  }

  async updateApplication(id, params) {
    const url = `${await this.applicationUrl()}/${id}`
    try {
      const response = await this.client.basicPut<any>('Murano', 'updateApplication', url, {
        package: params,
      })
      return response.package
    } catch (err) {
      console.log(err)
    }
  }
}

export default Murano
