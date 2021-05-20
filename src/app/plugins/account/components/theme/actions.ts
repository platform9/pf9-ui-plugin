import ApiClient from 'api-client/ApiClient'
import { preferencesActions } from 'core/session/preferencesReducers'
import { themeActions } from 'core/session/themeReducers'
import { AppPlugins, GlobalPreferences } from 'app/constants'
import { componentUpdaterObject } from 'core/themes/helpers'

const { preferenceStore } = ApiClient.getInstance()

export const getThemeConfig = async () => {
  const response = await preferenceStore.getGlobalPreference(GlobalPreferences.Theme)
  // Need to convert single quotes back to double quotes
  const config = JSON.parse(response.value)
  return config
}

export const updateThemeConfig = async (config) =>
  preferenceStore.updateGlobalPreference('theme', config)

export const deleteThemeConfig = async () => preferenceStore.deleteGlobalPreference('theme')

export const updateSessionTheme = (dispatch, settings, theme) => {
  const themeUpdateBody = {
    components: [
      componentUpdaterObject(['header', 'background'], settings.headerHex),
      componentUpdaterObject(['sidebar', AppPlugins.MyAccount, 'background'], settings.sidenavHex),
      componentUpdaterObject(['sidebar', AppPlugins.Kubernetes, 'background'], settings.sidenavHex),
      componentUpdaterObject(['sidebar', AppPlugins.OpenStack, 'background'], settings.sidenavHex),
      componentUpdaterObject(['sidebar', AppPlugins.BareMetal, 'background'], settings.sidenavHex),
    ],
  }
  dispatch(
    preferencesActions.updateLogo({
      logoUrl: settings.logoUrl,
    }),
  )
  dispatch(themeActions.updateThemeComponent(themeUpdateBody))
}
