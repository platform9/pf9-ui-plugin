import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { mergeLeft } from 'ramda'

export interface SessionState {
  unscopedToken: string
  scopedToken: string
  username: string
  expiresAt: string
  userDetails: { [key: string]: any }
  features: { [key: string]: any }
  isSsoToken: boolean
  onboardingRedirectToUrl: string
}

export const initialState: SessionState = {
  unscopedToken: null,
  scopedToken: null,
  username: null,
  expiresAt: null,
  userDetails: {},
  features: {},
  isSsoToken: false,
  onboardingRedirectToUrl: null,
}

const { name: sessionStoreKey, reducer: sessionReducers, actions: sessionActions } = createSlice({
  name: 'session',
  initialState,
  reducers: {
    initSession: (state, { payload }: PayloadAction<Partial<SessionState>>) => {
      return mergeLeft(payload, initialState)
    },
    updateSession: (state, { payload }: PayloadAction<Partial<SessionState>>) => {
      return mergeLeft(payload, state)
    },
    destroySession: () => {
      return initialState
    },
  },
})

export { sessionStoreKey, sessionActions }
export default sessionReducers
