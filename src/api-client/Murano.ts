import ApiService from 'api-client/ApiService'

class Murano extends ApiService {
  public getClassName() {
    return 'murano'
  }

  protected async getEndpoint() {
    return this.client.keystone.getServiceEndpoint('murano', 'internal')
  }

  v1 = () => `/v1`

  applicationUrl = () => `${this.v1()}/catalog/packages`

  uploadUrl = () => `${this.v1()}/catalog/packagesHot`

  async getApplications() {
    const url = this.applicationUrl()
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getApplications',
      },
    })
    return response.packages
  }

  async getApplication(id) {
    const url = `${this.applicationUrl()}/${id}`
    try {
      const response = await this.client.basicGet<any>({
        url,
        options: {
          clsName: this.getClassName(),
          mthdName: 'getApplication',
        },
      })
      return response.package
    } catch (err) {
      console.log(err)
    }
  }

  async uploadApplications(params) {
    const url = this.uploadUrl()
    try {
      const response = await this.client.basicPost<any>({
        url,
        body: params,
        options: {
          clsName: this.getClassName(),
          mthdName: 'uploadApplications',
        },
      })
      return response
    } catch (err) {
      console.log(err)
    }
  }

  async deleteApplication(id) {
    const url = `${this.applicationUrl()}/${id}`
    try {
      return await this.client.basicDelete<any>({
        url,
        options: {
          clsName: this.getClassName(),
          mthdName: 'deleteApplication',
        },
      })
    } catch (err) {
      console.log(err)
    }
  }

  async updateApplication(id, params) {
    const url = `${this.applicationUrl()}/${id}`
    try {
      const response = await this.client.basicPut<any>({
        url,
        body: {
          package: params,
        },
        options: {
          clsName: this.getClassName(),
          mthdName: 'updateApplication',
        },
      })
      return response.package
    } catch (err) {
      console.log(err)
    }
  }
}

export default Murano
