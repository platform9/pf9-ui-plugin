import { hot } from 'react-hot-loader'
import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
// import HotKeysProvider from 'core/providers/HotKeysProvider'
import ToastProvider from 'core/providers/ToastProvider'
import BannerProvider from 'core/providers/BannerProvider'
import AppContainer from 'core/containers/AppContainer'
import { BrowserRouter as Router } from 'react-router-dom'
import plugins from 'app/plugins'
import pluginManager from 'core/utils/pluginManager'
import store, { persistor } from './store'
import Progress from 'core/components/progress/Progress'
import ThemeManager from 'core/themes/ThemeManager'

plugins.forEach((plugin) => plugin.registerPlugin(pluginManager))

const App = () => {
  return (
    <Router>
      <Provider store={store}>
        <PersistGate
          loading={<Progress renderLoadingImage={false} loading message={'Loading app...'} />}
          persistor={persistor}
        >
          <ThemeManager>
            <ToastProvider>
              <BannerProvider>
                <AppContainer />
              </BannerProvider>
            </ToastProvider>
          </ThemeManager>
        </PersistGate>
      </Provider>
    </Router>
  )
}

export default hot(module)(App)
