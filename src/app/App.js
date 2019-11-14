import { hot } from 'react-hot-loader'
import React from 'react'
import AppProvider from 'core/AppProvider'
import AppContainer from 'core/components/AppContainer'
import HotKeysProvider from 'core/providers/HotKeysProvider'
import PreferencesProvider from 'core/providers/PreferencesProvider'
import { ToastProvider } from 'core/providers/ToastProvider'
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
import ForgotPasswordPage from './plugins/openstack/components/ForgotPasswordPage'
import DeveloperToolsEmbed from 'developer/components/DeveloperToolsEmbed'

plugins.forEach(plugin => plugin.registerPlugin(pluginManager))

const renderPluginRoutes = (id, plugin) => {
  const defaultRoute = plugin.getDefaultRoute()
  const genericRoutes = [
    // TODO implement generic login page?
    { link: { path: pathJoin(plugin.basePath, 'login') }, component: null },
    { link: { path: pathJoin(plugin.basePath, 'reset_password') }, exact: true, component: ResetPasswordPage },
    { link: { path: pathJoin(plugin.basePath, 'forgot_password') }, exact: true, component: ForgotPasswordPage },
    { link: { path: pathJoin(plugin.basePath, 'logout') }, exact: true, component: LogoutPage },
    {
      link: { path: pathJoin(plugin.basePath, '') },
      // TODO: Implement 404 page
      render: () => <Redirect to={defaultRoute || '/ui/404'} />,
    },
  ]
  return [...plugin.getRoutes(), ...genericRoutes].map(route => {
    const { component: Component, render, link } = route
    return <Route
      key={link.path}
      path={link.path}
      exact={link.exact || false}
      render={render}
      component={Component} />
  })
}

const getSections = moize(plugins =>
  toPairs(plugins).map(([id, plugin]) => ({
    id,
    name: plugin.name,
    links: plugin.getNavItems(),
  })))

const renderPlugins = moize(plugins =>
  toPairs(plugins).map(apply(renderPluginRoutes)).flat(),
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
                    <AppContainer sections={getSections(plugins)}>
                      <Switch>
                        {renderPlugins(plugins)}
                      </Switch>
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
