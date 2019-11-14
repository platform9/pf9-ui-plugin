import { hot } from 'react-hot-loader'
import React from 'react'
import AppProvider from 'core/providers/AppProvider'
import HotKeysProvider from 'core/providers/HotKeysProvider'
import PreferencesProvider from 'core/providers/PreferencesProvider'
import { ToastProvider } from 'core/providers/ToastProvider'
import AppContainer from 'core/containers/AppContainer'
import ThemeManager from './ThemeManager'
import { BrowserRouter as Router } from 'react-router-dom'
import plugins from 'app/plugins'
import pluginManager from 'core/utils/pluginManager'

plugins.forEach(plugin => plugin.registerPlugin(pluginManager))

const App = () => {
  // TODO: AppProvider and PreferencesProvider are tighly related
  // so they could probably be merged into a single component
  return (
    <Router>
      <HotKeysProvider>
        <AppProvider>
          <PreferencesProvider>
            <ThemeManager>
              <ToastProvider>
                <AppContainer />
              </ToastProvider>
            </ThemeManager>
          </PreferencesProvider>
        </AppProvider>
      </HotKeysProvider>
    </Router>
  )
}

export default hot(module)(App)
