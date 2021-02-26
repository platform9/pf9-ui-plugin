import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { setupFromConfig } from 'utils/registry'
import config from '../../config'
import ApiClient from 'api-client/ApiClient'
import './app.css'
// import './all.min.css'

Bugsnag.start({
  releaseStage: process.env.NODE_ENV,
  apiKey: process.env.BUGSNAG_KEY,
  plugins: [new BugsnagPluginReact()],
  appVersion: process.env.VERSION,
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
