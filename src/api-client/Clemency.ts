import config from '../../config'
import ApiService from 'api-client/ApiService'

export interface IApiData {
  username: string
  password: string
  secret: string
}

type IResetPassword = ({ secret, username, password }: IApiData) => Promise<any>

class Clemency extends ApiService {
  endpoint(): string {
    return config.apiHost
  }

  get baseUrl(): string {
    return `${this.endpoint()}/clemency`
  }

  requestNewPassword = async (username: string): Promise<any> => {
    const body = { username }
    return this.client.basicPost(`${this.baseUrl}/request`, body)
  }

  verifyPasswordReset = async (secret: string): Promise<any> => {
    return this.client.basicGet(`${this.baseUrl}/reset/password/${secret}`)
  }

  resetPassword: IResetPassword = async ({ secret, username, password }) => {
    const body = { username, password }
    return this.client.basicPost(`${this.baseUrl}/reset/password/${secret}`, body)
  }

  createUser = async (body): Promise<any> => {
    const response = await this.client.basicPost(`${this.baseUrl}/createacct`, body)
    return response.user
  }

  // this url format is strange but is a requirement for the API
  verifyActivateLink = async (username, otp): Promise<any> => {
    return this.client.basicGet(`${this.baseUrl}/activate/username=${username}&otp=${otp}`)
  }

  updateUser = async (body): Promise<any> => {
    return this.client.basicPost(`${this.baseUrl}/updateuser`, body)
  }
}

export default Clemency
