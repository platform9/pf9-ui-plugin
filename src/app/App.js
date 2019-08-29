import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import AppProvider from 'core/AppProvider'
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
import moize from 'moize'

class App extends PureComponent {
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

  getSections = moize(plugins =>
    toPairs(plugins).map(([id, plugin]) => ({
      id,
      name: plugin.name,
      links: plugin.getNavItems(),
    })))

  renderPlugins = moize(plugins =>
    toPairs(plugins).map(apply(this.renderPluginRoutes)),
  )

  render () {
    const { pluginManager } = this.props
    const plugins = pluginManager.getPlugins()
    const devEnabled = window.localStorage.enableDevPlugin === 'true'
    return (
      <Router>
        <HotKeysProvider>
          <AppProvider initialContext={{ initialized: false, sessionLoaded: false }}>
            <PreferencesProvider>
              <ThemeManager>
                <ToastProvider>
                  <div id="_main-container">
                    <SessionManager>
                      <AppContainer
                        sections={this.getSections(plugins)}>
                        {this.renderPlugins(plugins)}
                        {devEnabled && <DeveloperToolsEmbed />}
                      </AppContainer>
                    </SessionManager>
                  </div>
                </ToastProvider>
              </ThemeManager>
            </PreferencesProvider>
          </AppProvider>
        </HotKeysProvider>
      </Router>
    )
  }
}

App.propTypes = {
  pluginManager: PropTypes.object,
}

export default App
