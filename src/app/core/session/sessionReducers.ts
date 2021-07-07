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
}

export const initialState: SessionState = {
  unscopedToken: null,
  scopedToken: null,
  username: null,
  expiresAt: null,
  userDetails: {},
  features: {},
  isSsoToken: false,
}

const { name: sessionStoreKey, reducer: sessionReducers, actions: sessionActions } = createSlice({
  name: 'session',
  initialState,
  reducers: {
    initSession: (state, { payload }: PayloadAction<Partial<SessionState>>) => {
      console.count('sessionReducers/initSession')
      return mergeLeft(payload, initialState)
    },
    updateSession: (state, { payload }: PayloadAction<Partial<SessionState>>) => {
      console.count('sessionReducers/updateSession')
      return mergeLeft(payload, state)
    },
    destroySession: () => {
      console.count('sessionReducers/destroySession')
      return initialState
    },
  },
})

export { sessionStoreKey, sessionActions }
export default sessionReducers
