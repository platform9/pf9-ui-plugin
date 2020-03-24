import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { mergeLeft } from 'ramda'

export interface ISessionState {
  unscopedToken: string
  username: string
  expiresAt: string
  currentTenant: string
  currentRegion: string
  userDetails?: any
  userPreferences: { [key: string]: any }
}

export const initialState: ISessionState = {
  unscopedToken: null,
  username: null,
  expiresAt: null,
  currentTenant: null,
  currentRegion: null,
  userDetails: null,
  userPreferences: {}
}

const {
  name: sessionStoreKey,
  reducer: sessionReducers,
  actions: sessionActions,
} = createSlice({
  name: 'session',
  initialState,
  reducers: {
    initSession: (
      state,
      { payload }: PayloadAction<Partial<ISessionState>>) => {
      return mergeLeft(payload, initialState)
    },
    updateSession: (
      state,
      { payload }: PayloadAction<Partial<ISessionState>>) => {
      return mergeLeft(payload, state)
    },
    destroySession: () => {
      return initialState
    },
  },
})

export { sessionStoreKey, sessionActions }
export default sessionReducers
