import ApiClient from 'api-client/ApiClient'
import { preferencesActions } from 'core/session/preferencesReducers'
import { themeActions } from 'core/session/themeReducers'
import { GlobalPreferences } from 'app/constants'
import { generateThemeUpdatePayload } from 'account/components/theme/helpers'

const { preferenceStore } = ApiClient.getInstance()

export const getThemeConfig = async () => {
  const response = await preferenceStore.getGlobalPreference(GlobalPreferences.Theme)
  // Need to convert single quotes back to double quotes
  const config = JSON.parse(response.value)
  return config
}

export const updateThemeConfig = async (config) =>
  preferenceStore.updateGlobalPreference(GlobalPreferences.Theme, config)

export const deleteThemeConfig = async () =>
  preferenceStore.deleteGlobalPreference(GlobalPreferences.Theme)

export const updateSessionTheme = (dispatch, settings) => {
  const themeUpdateBody = generateThemeUpdatePayload({
    headerColor: settings.headerHex,
    sidenavColor: settings.sidenavHex,
  })
  dispatch(
    preferencesActions.updateLogo({
      logoUrl: settings.logoUrl,
    }),
  )
  dispatch(themeActions.updateThemeComponent(themeUpdateBody))
}
