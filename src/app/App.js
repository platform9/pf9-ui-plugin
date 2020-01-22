import { hot } from 'react-hot-loader'
import React from 'react'
import AppProvider from 'core/providers/AppProvider'
import HotKeysProvider from 'core/providers/HotKeysProvider'
import PreferencesProvider from 'core/providers/PreferencesProvider'
import ToastProvider from 'core/providers/ToastProvider'
import BannerProvider from 'core/providers/BannerProvider'
import AppContainer from 'core/containers/AppContainer'
import ThemeManager from './ThemeManager'
import { BrowserRouter as Router } from 'react-router-dom'
import plugins from 'app/plugins'
import pluginManager from 'core/utils/pluginManager'

plugins.forEach(plugin => plugin.registerPlugin(pluginManager))

const App = () => {
  // TODO: Simplify and combine some of these providers
  return (
    <Router>
      <HotKeysProvider>
        <AppProvider>
          <PreferencesProvider>
            <ThemeManager>
              <ToastProvider>
                <BannerProvider>
                  <AppContainer />
                </BannerProvider>
              </ToastProvider>
            </ThemeManager>
          </PreferencesProvider>
        </AppProvider>
      </HotKeysProvider>
    </Router>
  )
}

export default hot(module)(App)
