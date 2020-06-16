import { combineReducers } from 'redux'
import sessionReducers, { sessionStoreKey } from 'core/session/sessionReducers'
import cacheReducers, { cacheStoreKey } from 'core/caching/cacheReducers'
import notificationReducers, { notificationStoreKey } from 'core/notifications/notificationReducers'
import preferencesReducers, { preferencesStoreKey } from 'core/session/preferencesReducers'

const rootReducer = combineReducers({
  [sessionStoreKey]: sessionReducers,
  [cacheStoreKey]: cacheReducers,
  [notificationStoreKey]: notificationReducers,
  [preferencesStoreKey]: preferencesReducers,
})

export default rootReducer
