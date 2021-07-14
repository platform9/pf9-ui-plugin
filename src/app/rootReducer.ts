import { combineReducers } from 'redux'
import sessionReducers, { sessionStoreKey } from 'core/session/sessionReducers'
import cacheReducers, {
  cacheStoreKey,
  loadingStoreKey,
  dataStoreKey,
  updatingStoreKey,
} from 'core/caching/cacheReducers'
import notificationReducers, { notificationStoreKey } from 'core/notifications/notificationReducers'
import preferencesReducers, { preferencesStoreKey } from 'core/session/preferencesReducers'
import clientReducers, { clientStoreKey } from 'core/client/clientReducers'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { persistReducer } from 'redux-persist'
import themeReducers, { customThemeKey } from 'core/session/themeReducers'

const persistCacheConfig = {
  key: cacheStoreKey,
  storage,
  blacklist: [loadingStoreKey, dataStoreKey, updatingStoreKey],
}

const rootReducer = combineReducers({
  [sessionStoreKey]: sessionReducers,
  [cacheStoreKey]: persistReducer(persistCacheConfig, cacheReducers),
  [notificationStoreKey]: notificationReducers,
  [preferencesStoreKey]: preferencesReducers,
  [customThemeKey]: themeReducers,
  [clientStoreKey]: clientReducers,
})

export default rootReducer
