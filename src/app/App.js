import React from 'react'
import PropTypes from 'prop-types'
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'
import Navbar from 'core/common/Navbar'
import LogoutPage from 'openstack/components/LogoutPage'
import './app.css'
import theme from './theme'
import { setupFromConfig } from './util/registry'
import config from '../../config'
import AppContext from 'core/AppContext'
import ApiClient from '../api-client'
import SessionManager from 'openstack/components/SessionManager'
import DeveloperToolsEmbed from 'developer/components/DeveloperToolsEmbed'

setupFromConfig(config)
window.process = process

if (!config.apiHost) { throw new Error('config.js does not contain "apiHost"') }

const apiClient = new ApiClient({ keystoneEndpoint: `${config.apiHost}/keystone` })
apiClient.setActiveRegion(config.region)

class App extends React.Component {
  render () {
    const { pluginManager } = this.props
    const options = pluginManager.getOptions()
    const { showFooter } = options

    const renderFooter = () => (
      <div id="_main-footer">
        TODO: Footer
      </div>
    )

    return (
      <Router>
        <MuiThemeProvider theme={theme}>
          <AppContext initialContext={{ apiClient, initialized: false }}>
            <div id="_main-container">
              <SessionManager>
                <Navbar links={pluginManager.getNavItems()}>
                  {pluginManager.getComponents().map((PluginComponent, idx) => <PluginComponent key={idx} />)}
                  <Switch>
                    {pluginManager.getRoutes().map(route => {
                      const { component, link } = route
                      const Component = component
                      return <Route key={route.name} path={link.path} exact={link.exact || false} component={Component} />
                    })}
                    <Route path="/ui/openstack/login" component={null} />
                    <Route path="/ui/logout" exact component={LogoutPage} />
                    <Redirect to={pluginManager.getDefaultRoute()} />
                  </Switch>
                  <DeveloperToolsEmbed />
                  {showFooter && renderFooter()}
                </Navbar>
              </SessionManager>
            </div>
          </AppContext>
        </MuiThemeProvider>
      </Router>
    )
  }
}

App.propTypes = {
  pluginManager: PropTypes.object
}

export default App
