import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { setupFromConfig } from 'utils/registry'
import config from '../../config'
import ApiClient from 'api-client/ApiClient'
import './app.css'

Bugsnag.start({
  apiKey: '3eb58c77ada2a9db70fc7a8e81e97b99',
  plugins: [new BugsnagPluginReact()],
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
