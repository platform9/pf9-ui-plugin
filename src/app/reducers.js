import { combineReducers } from 'redux'
import sessionReducers, { sessionStoreKey } from 'core/session/sessionReducers'
import cacheReducers, { cacheStoreKey } from 'core/caching/cacheReducers'
import notificationReducers, { notificationStoreKey } from 'core/notifications/notificationReducers'
import themeReducers, { themeStoreKey } from 'core/themes/themeReducers'

export default combineReducers({
  [sessionStoreKey]: sessionReducers,
  [cacheStoreKey]: cacheReducers,
  [notificationStoreKey]: notificationReducers,
  [themeStoreKey]: themeReducers,
})
