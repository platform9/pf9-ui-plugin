import ApiService from './ApiService'
import config from '../../config'

class PreferenceStore extends ApiService {
  public getClassName() {
    return 'preferenceStore'
  }

  protected async getEndpoint() {
    return Promise.resolve(config.apiHost)
  }

  get baseUrl(): string {
    return '/preference-store'
  }

  getUserPreference = async (userId, key) => {
    const url = `${this.baseUrl}/user/${userId}/${key}`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getUserPreference',
      },
    })
  }

  // setUserPreference = async (userId, body, key) => {
  //   const url = `${this.baseUrl}/user/${userId}/${key}`
  //   return this.client.basicPut({
  //     url,
  //     body,
  //     options: {
  //       clsName: this.getClassName(),
  //       mthdName: 'addUserPreference',
  //     },
  //   })
  // }

  setUserPreference = async (userId, body, key) => {
    const url = `${this.baseUrl}/user/${userId}/${key}`
    const authHeaders = this.client.getAuthHeaders()['headers']['X-Auth-Token']
    console.log({ 'X-Auth-Token': authHeaders, 'Content-Type': 'application/json' })
    return this.client.rawPut({
      url,
      data: body,
      config: {
        headers: { 'X-Auth-Token': authHeaders, 'Content-Type': 'application/json' },
        withCredentials: true,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'getUserPreference',
      },
    })
  }

  deleteUserPreference = async (userId, key) => {
    const url = `${this.baseUrl}/user/${userId}/${key}`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteUserPreference',
      },
    })
  }

  getGlobalPreference = async (key) => {
    const url = `${this.baseUrl}/global/${key}`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getGlobalPreference',
      },
    })
  }

  setGlobalPreference = async (key, body) => {
    const url = `${this.baseUrl}/global/${key}`
    return this.client.basicPut({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addGlobalPreference',
      },
    })
  }

  deleteGlobalPreference = async (key) => {
    const url = `${this.baseUrl}/global/${key}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteGlobalPreference',
      },
    })
  }
}

export default PreferenceStore
