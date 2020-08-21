import { combineReducers } from 'redux'
import sessionReducers, { sessionStoreKey } from 'core/session/sessionReducers'
import cacheReducers, { cacheStoreKey } from 'core/caching/cacheReducers'
import notificationReducers, { notificationStoreKey } from 'core/notifications/notificationReducers'
import preferencesReducers, { preferencesStoreKey } from 'core/session/preferencesReducers'
import clientReducers, { clientStoreKey } from 'core/client/clientReducers'

const rootReducer = combineReducers({
  [sessionStoreKey]: sessionReducers,
  [cacheStoreKey]: cacheReducers,
  [notificationStoreKey]: notificationReducers,
  [preferencesStoreKey]: preferencesReducers,
  [clientStoreKey]: clientReducers,
})

export default rootReducer
