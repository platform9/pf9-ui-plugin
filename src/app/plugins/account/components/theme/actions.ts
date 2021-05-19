import ApiClient from 'api-client/ApiClient'
import { preferencesActions } from 'core/session/preferencesReducers'
import { themeActions } from 'core/session/themeReducers'
import { AppPlugins } from 'app/constants'

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

export const updateSessionTheme = () => {
  return (dispatch, settings, theme) => {
    const themeUpdateBody = {
      components: [
        { pathTo: ['header', 'background'], value: settings.headerHex || theme.palette.grey[900] },
        {
          pathTo: ['sidebar', AppPlugins.MyAccount, 'background'],
          value: settings.sidenavHex || theme.palette.grey[200],
        },
        {
          pathTo: ['sidebar', AppPlugins.Kubernetes, 'background'],
          value: settings.sidenavHex || theme.palette.grey[800],
        },
        {
          pathTo: ['sidebar', AppPlugins.OpenStack, 'background'],
          value: settings.sidenavHex || theme.palette.grey[800],
        },
        {
          pathTo: ['sidebar', AppPlugins.BareMetal, 'background'],
          value: settings.sidenavHex || theme.palette.grey[800],
        },
      ],
    }
    dispatch(
      preferencesActions.updateLogo({
        logoUrl: settings.logoUrl,
      }),
    )
    dispatch(themeActions.updateThemeComponent(themeUpdateBody))
  }
}
