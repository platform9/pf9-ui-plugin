import { setupFromConfig } from 'utils/registry'
import config from '../../config'
import ApiClient from 'api-client/index'
import './app.css'

setupFromConfig(config)
window.process = process

if (config.apiHost === undefined) {
  throw new Error('config.js does not contain "apiHost"')
}

// Initialize ApiClient singleton
// We must import bootstrap.js before any component
// so that ApiClient singletong will be available to use in the plugin actions
ApiClient.init({ keystoneEndpoint: `${config.apiHost}/keystone` })
