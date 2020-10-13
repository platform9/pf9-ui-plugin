import config from '../../config'
import ApiService from 'api-client/ApiService'
import { trackApiMethodMetadata } from './helpers'

export interface IApiData {
  username: string
  password: string
  secret: string
}

type IResetPassword = ({ secret, username, password }: IApiData) => Promise<any>

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
    const body = { username }
    return this.client.basicPost({
      url: `${this.baseUrl}/request`,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'requestNewPassword',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clemency/reset/password/{secret}',
    type: 'GET',
    params: ['secret'],
  })
  verifyPasswordReset = async (secret: string): Promise<any> => {
    return this.client.basicGet({
      url: `${this.baseUrl}/reset/password/${secret}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'verifyPasswordReset',
      },
    })
  }

  resetPassword: IResetPassword = async ({ secret, username, password }) => {
    const body = { username, password }
    return this.client.basicPost({
      url: `${this.baseUrl}/reset/password/${secret}`,
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
  @trackApiMethodMetadata({
    url: '/clemency/activate/username={username}&otp={otp}',
    type: 'GET',
    params: ['username', 'otp'],
  })
  verifyActivateLink = async (username, otp): Promise<any> => {
    return this.client.basicGet({
      url: `${this.baseUrl}/activate/username=${username}&otp=${otp}`,
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
