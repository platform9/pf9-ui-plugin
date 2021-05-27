import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { setupFromConfig } from 'utils/registry'
import config from '../../config'
import ApiClient from 'api-client/ApiClient'
import './app.css'
import { version } from '../../package.json'
// import './all.min.css'
import store from 'app/store'
import { GlobalPreferences } from 'app/constants'
import { preferencesActions } from 'core/session/preferencesReducers'
import { generateThemeUpdatePayload } from 'account/components/theme/helpers'
import { themeActions } from 'core/session/themeReducers'

Bugsnag.start({
  releaseStage: process.env.NODE_ENV,
  apiKey: process.env.BUGSNAG_KEY,
  plugins: [new BugsnagPluginReact()],
  appVersion: version,
  enabledReleaseStages: ['production'],
})

setupFromConfig(config)
window.process = process

if (config.apiHost === undefined) {
  throw new Error('config.js does not contain "apiHost"')
}

// Initialize ApiClient singleton
// We must import bootstrap.js before any component
// so that ApiClient singletong will be available to use in the plugin actions
ApiClient.init({ keystoneEndpoint: `${config.apiHost}/keystone` })
const { preferenceStore } = ApiClient.getInstance()

const loadTheme = async () => {
  try {
    const response = await preferenceStore.getGlobalPreference(GlobalPreferences.Theme)
    const customTheme = JSON.parse(response.value)

    if (!customTheme) {
      return
    }

    if (customTheme.logoUrl) {
      store.dispatch(
        preferencesActions.updateLogo({
          logoUrl: customTheme.logoUrl,
        }),
      )
    } else {
      // Todo: Wait for store to rehydrate, check for presence of a custom logo
      // and reset if there is one present
      store.dispatch(preferencesActions.resetGlobalPrefs())
    }

    store.dispatch(themeActions.updateThemeComponent(generateThemeUpdatePayload(customTheme)))
  } catch (err) {
    // Reset the prefs if store not available
    store.dispatch(preferencesActions.resetGlobalPrefs())
    console.error(err)
  }
}
loadTheme()
