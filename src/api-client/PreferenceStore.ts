import config from '../../config'
import ApiService from 'api-client/ApiService'
import { PreferenceStoreResponse } from './preference-store.model'
import { GlobalPreferences } from 'app/constants'

class PreferenceStore extends ApiService {
  public getClassName() {
    return 'preference-store'
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

  getGlobalPreference = async (key: GlobalPreferences) => {
    return this.client.basicGet<PreferenceStoreResponse>({
      url: `${this.baseUrl}/global/${key}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getGlobalPreference',
      },
    })
  }

  updateGlobalPreference = async (key: GlobalPreferences, value) => {
    const jsonString = JSON.stringify(value)
    const body = {
      value: jsonString,
    }
    return this.client.basicPut({
      url: `${this.baseUrl}/global/${key}`,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateGlobalPreference',
      },
    })
  }

  deleteGlobalPreference = async (key: GlobalPreferences) => {
    return this.client.basicDelete({
      url: `${this.baseUrl}/global/${key}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteGlobalPreference',
      },
    })
  }
}

export default PreferenceStore
