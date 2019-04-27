import React from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider } from '@material-ui/styles'
import AppContext from 'core/AppContext'
import AppContainer from 'core/components/AppContainer'
import HotKeysProvider from 'core/providers/HotKeysProvider'
import PreferencesProvider from 'core/providers/PreferencesProvider'
import { ToastProvider } from 'core/providers/ToastProvider'
import DeveloperToolsEmbed from 'developer/components/DeveloperToolsEmbed'
import LogoutPage from 'openstack/components/LogoutPage'
import SessionManager from 'openstack/components/SessionManager'
import ThemeManager from './ThemeManager'
import { apply, toPairs } from 'ramda'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import { pathJoin } from 'utils/misc'
import config from '../../config'
import ApiClient from '../api-client'
import './app.css'
import theme from './theme'
import { setupFromConfig } from './utils/registry'

setupFromConfig(config)
window.process = process

if (config.apiHost === undefined) { throw new Error('config.js does not contain "apiHost"') }

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
    const defaultRoute = plugin.getDefaultRoute()
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
          <Route path={pathJoin(plugin.basePath, 'login')} component={null} />
          <Route path={pathJoin(plugin.basePath, 'logout')} exact component={LogoutPage} />
          {defaultRoute && <Redirect to={defaultRoute || '/ui/404'} />}
          {showFooter && this.renderFooter()}
        </Switch>
      }} />
  }

  render () {
    const { pluginManager } = this.props
    const plugins = toPairs(pluginManager.getPlugins())
    const devEnabled = window.localStorage.enableDevPlugin === 'true'
    return (
      <Router>
        <ThemeProvider theme={theme}>
          <HotKeysProvider>
            <AppContext initialContext={{ apiClient, initialized: false, sessionLoaded: false }}>
              <ToastProvider>
                <PreferencesProvider>
                  <ThemeManager>
                    <div id="_main-container">
                      <SessionManager>
                        <AppContainer
                          sections={plugins.map(([id, plugin]) => ({
                            id,
                            name: plugin.name,
                            links: plugin.getNavItems()
                          }))}>
                          {plugins.map(apply(this.renderPluginRoutes))}
                          {devEnabled && <DeveloperToolsEmbed />}
                        </AppContainer>
                      </SessionManager>
                    </div>
                  </ThemeManager>
                </PreferencesProvider>
              </ToastProvider>
            </AppContext>
          </HotKeysProvider>
        </ThemeProvider>
      </Router>
    )
  }
}

App.propTypes = {
  pluginManager: PropTypes.object
}

export default App
