import rootReducer from 'app/rootReducer'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { createStore } from '@reduxjs/toolkit'
import { composeWithDevTools } from 'redux-devtools-extension'
import { cacheStoreKey } from 'core/caching/cacheReducers'

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [cacheStoreKey],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = createStore(persistedReducer, composeWithDevTools())

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>

export default store
