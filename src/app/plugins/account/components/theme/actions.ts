import ApiClient from 'api-client/ApiClient'

const { preferenceStore } = ApiClient.getInstance()

export const getThemeConfig = async () => {
  const response = await preferenceStore.getGlobalPreference('theme')
  // Need to convert single quotes back to double quotes
  const config = JSON.parse(response.value.replace(/'/g, '"'))
  return config
}

export const updateThemeConfig = async (config) =>
  preferenceStore.updateGlobalPreference('theme', config)

export const deleteThemeConfig = async () => preferenceStore.deleteGlobalPreference('theme')
