import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import DataKeys from 'k8s/DataKeys'

const { preferenceStore } = ApiClient.getInstance()

export const userPreferenceStoreActions = createCRUDActions(DataKeys.UserPreferences, {
  listFn: async ({ userId, key }) => {
    return preferenceStore.getUserPreference(userId, key)
  },
  createFn: async ({ userId, key, value }) => {
    const body = { value: value }
    return preferenceStore.setUserPreference(userId, body, key)
  },
  deleteFn: async ({ userId, key }) => {
    return preferenceStore.deleteUserPreference(userId, key)
  },
})

export const globalPreferenceStoreActions = createCRUDActions(DataKeys.GlobalPreferences, {
  listFn: async ({ key }) => {
    return preferenceStore.getGlobalPreference(key)
  },
  createFn: async ({ key, value }) => {
    const body = { value: value }
    return preferenceStore.setGlobalPreference(key, body)
  },
  deleteFn: async ({ key }) => {
    return preferenceStore.deleteGlobalPreference(key)
  },
})
