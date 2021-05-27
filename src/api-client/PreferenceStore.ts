import config from '../../config'
import ApiService from 'api-client/ApiService'
import { PreferenceStoreResponse } from './preference-store.model'
import { GlobalPreferences, UserPreferences } from 'app/constants'

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

  getUserPreference = async (userId, key: UserPreferences) => {
    return this.client.basicGet({
      url: `${this.baseUrl}/user/${userId}/${key}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getUserPreference',
      },
    })
  }

  setUserPreference = async (userId, key: UserPreferences, value) => {
    const jsonString = JSON.stringify(value)
    const body = {
      value: jsonString,
    }
    return this.client.basicPut({
      url: `${this.baseUrl}/user/${userId}/${key}`,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addUserPreference',
      },
    })
  }

  deleteUserPreference = async (userId, key: UserPreferences) => {
    return this.client.basicGet({
      url: `${this.baseUrl}/user/${userId}/${key}`,
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
