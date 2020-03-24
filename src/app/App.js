import { hot } from 'react-hot-loader'
import React from 'react'
import { Provider } from 'react-redux'
import HotKeysProvider from 'core/providers/HotKeysProvider'
import PreferencesProvider from 'core/providers/PreferencesProvider'
import ToastProvider from 'core/providers/ToastProvider'
import BannerProvider from 'core/providers/BannerProvider'
import AppContainer from 'core/containers/AppContainer'
import ThemeManager from './ThemeManager'
import { BrowserRouter as Router } from 'react-router-dom'
import plugins from 'app/plugins'
import pluginManager from 'core/utils/pluginManager'
import store from './store'

plugins.forEach((plugin) => plugin.registerPlugin(pluginManager))

const App = () => {
  return (
    <Router>
      <Provider store={store}>
        <HotKeysProvider>
          <PreferencesProvider>
            <ThemeManager>
              <ToastProvider>
                <BannerProvider>
                  <AppContainer />
                </BannerProvider>
              </ToastProvider>
            </ThemeManager>
          </PreferencesProvider>
        </HotKeysProvider>
      </Provider>
    </Router>
  )
}

export default hot(module)(App)
