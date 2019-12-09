import config from '../../config'
import ApiService from 'api-client/ApiService'

class Clemency extends ApiService {
  endpoint () {
    return config.host
  }

  baseUrl () {
    return `${this.endpoint}/clemency`
  }

  requestNewPassword = async (username) => {
    const body = { username }
    return this.client.basicPost(`${this.baseUrl}/request`, body)
  }

  verifyPasswordReset = async (secret) => {
    return this.client.basicGet(`${this.baseUrl}/reset/password/#${secret}`)
  }

  resetPassword = async (secret, username, password) => {
    const body = {
      username, password,
    }
    return this.client.basicPost(`${this.baseUrl}/reset/password/#${secret}`, body)
  }

  createUser = async params => {
    const { tenants, ...user } = params
    const body = { user, tenants }
    return this.client.basicPost(`${this.baseUrl}/createacct`, body)
  }

  verifyActivateLink = async secret => {
    return this.client.basicGet(`${this.baseUrl}/activate/#${secret}`)
  }

  updateUser = async body => {
    return this.client.basicPost(`${this.baseUrl}/updateuser`, body)
  }
}

export default Clemency
