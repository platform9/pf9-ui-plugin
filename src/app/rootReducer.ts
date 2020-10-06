import { combineReducers } from 'redux'
import sessionReducers, { sessionStoreKey } from 'core/session/sessionReducers'
import cacheReducers, { cacheStoreKey } from 'core/caching/cacheReducers'
import notificationReducers, { notificationStoreKey } from 'core/notifications/notificationReducers'
import preferencesReducers, { preferencesStoreKey } from 'core/session/preferencesReducers'
import clientReducers, { clientStoreKey } from 'core/client/clientReducers'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { persistReducer } from 'redux-persist'

const persistCacheConfig = {
  key: cacheStoreKey,
  storage,
  blacklist: ['loadingData'],
}

const rootReducer = combineReducers({
  [sessionStoreKey]: sessionReducers,
  [cacheStoreKey]: persistReducer(persistCacheConfig, cacheReducers),
  [notificationStoreKey]: notificationReducers,
  [preferencesStoreKey]: preferencesReducers,
  [clientStoreKey]: clientReducers,
})

export default rootReducer
