import config from '../../config'
import ApiService from 'api-client/ApiService'

class Hagrid extends ApiService {
  public getClassName() {
    return 'hagrid'
  }

  protected async getEndpoint() {
    return Promise.resolve(config.apiHost)
  }

  get baseUrl(): string {
    return `/hagrid`
  }

  getSsoDetails = async () => {
    return this.client.rawGet({
      url: `${this.baseUrl}/sso`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getSsoDetails',
      },
    })
  }

  getSsoConfig = async () => {
    return this.client.basicGet({
      url: `${this.baseUrl}/ssoconfig`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getSsoConfig',
      },
    })
  }

  createSsoConfig = async (body) => {
    return this.client.basicPost({
      url: `${this.baseUrl}/ssoconfig`,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createSsoConfig',
      },
    })
  }

  deleteSsoConfig = async () => {
    return this.client.basicDelete({
      url: `${this.baseUrl}/ssoconfig`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteSsoConfig',
      },
    })
  }
}

export default Hagrid
