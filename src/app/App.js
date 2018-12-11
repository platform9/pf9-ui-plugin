import React from 'react'
import PropTypes from 'prop-types'
import {
  BrowserRouter as Router, Redirect, Route, Switch,
} from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'
import AppContainer from 'core/common/AppContainer'
import LogoutPage from 'openstack/components/LogoutPage'
import './app.css'
import theme from './theme'
import { setupFromConfig } from './utils/registry'
import config from '../../config'
import AppContext from 'core/AppContext'
import ApiClient from '../api-client'
import HotKeysProvider from 'core/common/HotKeysProvider'
import { apply, toPairs } from 'ramda'
import SessionManager from 'openstack/components/SessionManager'
import DeveloperToolsEmbed from 'developer/components/DeveloperToolsEmbed'
import PreferencesProvider from 'core/helpers/PreferencesProvider'

setupFromConfig(config)
window.process = process

if (!config.apiHost) { throw new Error('config.js does not contain "apiHost"') }

const apiClient = new ApiClient({ keystoneEndpoint: `${config.apiHost}/keystone` })
apiClient.setActiveRegion(config.region)

class App extends React.Component {
  renderFooter = () => (
    <div id="_main-footer">
      TODO: Footer
    </div>
  )

  renderPluginRoutes = (id, plugin) => {
    const options = plugin.getOptions()
    // TODO: Implement 404 page
    const defaultRoute = plugin.getDefaultRoute() || '/ui/404'
    const { showFooter } = options
    return <Route key={id} path={plugin.basePath}
      exact={false}
      render={() => {
        return <Switch>
          {/* Plugin components */}
          {plugin.getComponents().map((PluginComponent, idx) =>
            <PluginComponent key={idx} />)}

          {/* Plugin specific routes */}
          {plugin.getRoutes().map(route => {
            const { component: Component, link } = route
            return <Route key={route.name}
              path={link.path}
              exact={link.exact || false}
              component={Component} />
          })}

          {/* TODO implement generic login page? */}
          <Route path="/ui/openstack/login" component={null} />
          <Route path="/ui/logout" exact component={LogoutPage} />
          <Redirect to={defaultRoute} />
          {showFooter && this.renderFooter()}
        </Switch>
      }} />
  }

  render () {
    const { pluginManager } = this.props
    const plugins = toPairs(pluginManager.getPlugins())
    return (
      <Router>
        <MuiThemeProvider theme={theme}>
          <HotKeysProvider>
            <AppContext initialContext={{ apiClient, initialized: false }}>
              <PreferencesProvider>
                <div id="_main-container">
                  <SessionManager>
                    <AppContainer
                      sections={plugins.map(([id, plugin]) => ({
                        id,
                        name: plugin.name,
                        links: plugin.getNavItems()
                      }))}>
                      {plugins.map(apply(this.renderPluginRoutes))}
                      <DeveloperToolsEmbed />
                    </AppContainer>
                  </SessionManager>
                </div>
              </PreferencesProvider>
            </AppContext>
          </HotKeysProvider>
        </MuiThemeProvider>
      </Router>
    )
  }
}

App.propTypes = {
  pluginManager: PropTypes.object
}

export default App
