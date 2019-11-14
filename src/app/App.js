import { hot } from 'react-hot-loader'
import React from 'react'
import AppProvider from 'core/AppProvider'
import AppContainer from 'core/components/AppContainer'
import HotKeysProvider from 'core/providers/HotKeysProvider'
import PreferencesProvider from 'core/providers/PreferencesProvider'
import { ToastProvider } from 'core/providers/ToastProvider'
import SessionManager from 'openstack/components/SessionManager'
import ThemeManager from './ThemeManager'
import { BrowserRouter as Router } from 'react-router-dom'
import plugins from 'app/plugins'
import pluginManager from 'core/utils/pluginManager'

plugins.forEach(plugin => plugin.registerPlugin(pluginManager))

const App = () => {
  // TODO: AppProvider and PreferencesProvider are tighly coupled
  // so they probably could be merged into a single component
  return (
    <Router>
      <HotKeysProvider>
        <AppProvider>
          <PreferencesProvider>
            <ThemeManager>
              <ToastProvider>
                <SessionManager>
                  <AppContainer />
                </SessionManager>
              </ToastProvider>
            </ThemeManager>
          </PreferencesProvider>
        </AppProvider>
      </HotKeysProvider>
    </Router>
  )
}

export default hot(module)(App)
