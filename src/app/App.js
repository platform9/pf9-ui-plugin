import { hot } from 'react-hot-loader'
import React from 'react'
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
import plugins from 'app/plugins'
import pluginManager from 'core/utils/pluginManager'
import ResetPasswordPage from './plugins/openstack/components/ResetPasswordPage'

plugins.forEach(plugin => plugin.registerPlugin(pluginManager))

const renderFooter = () => (
  <div id="_main-footer">
    TODO: Footer
  </div>
)

const renderPluginRoutes = (id, plugin) => {
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
        <Route path={pathJoin(plugin.basePath, 'reset_password')} component={ResetPasswordPage} />
        <Route path={pathJoin(plugin.basePath, 'logout')} exact component={LogoutPage} />
        {defaultRoute && <Redirect to={defaultRoute || '/ui/404'} />}
        {showFooter && renderFooter()}
      </Switch>
    }} />
}

const getSections = moize(plugins =>
  toPairs(plugins).map(([id, plugin]) => ({
    id,
    name: plugin.name,
    links: plugin.getNavItems(),
  })))

const renderPlugins = moize(plugins =>
  toPairs(plugins).map(apply(renderPluginRoutes)),
)

const App = () => {
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
                      sections={getSections(plugins)}>
                      {renderPlugins(plugins)}
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

export default hot(module)(App)
