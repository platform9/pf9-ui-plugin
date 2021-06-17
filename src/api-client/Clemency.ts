import config from '../../config'
import ApiService from 'api-client/ApiService'

export interface IApiData {
  username: string
  password: string
  token: string
}

type IResetPassword = ({ token, username, password }: IApiData) => Promise<any>

class Clemency extends ApiService {
  public getClassName() {
    return 'clemency'
  }

  protected async getEndpoint() {
    return Promise.resolve(config.apiHost)
  }

  get baseUrl(): string {
    return `/clemency`
  }

  requestNewPassword = async (username: string): Promise<any> => {
    const body = { username, ui_version: 'serenity' }
    return this.client.basicPost({
      url: `${this.baseUrl}/request`,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'requestNewPassword',
      },
    })
  }

  verifyPasswordReset = async (secret: string): Promise<any> => {
    return this.client.basicGet({
      url: `${this.baseUrl}/reset/password/${secret}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'verifyPasswordReset',
      },
    })
  }

  resetPassword: IResetPassword = async ({ token, username, password }) => {
    const body = { username, password, token }
    return this.client.basicPost({
      url: `${this.baseUrl}/reset/password`,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'resetPassword',
      },
    })
  }

  createUser = async (body): Promise<any> => {
    const response = await this.client.basicPost<any>({
      url: `${this.baseUrl}/createacct`,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createUser',
      },
    })
    return response.user
  }

  // this url format is strange but is a requirement for the API
  verifyActivateLink = async (username, otp): Promise<any> => {
    return this.client.basicGet({
      url: `${this.baseUrl}/activate?username=${username}&otp=${otp}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'verifyActivateLink',
      },
    })
  }

  updateUser = async (body): Promise<any> => {
    return this.client.basicPost({
      url: `${this.baseUrl}/updateuser`,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateUser',
      },
    })
  }
}

export default Clemency
