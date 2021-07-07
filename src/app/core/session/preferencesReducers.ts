import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { mergeLeft, over, lensPath } from 'ramda'

export interface PreferencesState {
  username: string
  key: string | string[]
  prefs: { [key: string]: { [key: string]: any } }
}

const {
  name: preferencesStoreKey,
  reducer: preferencesReducers,
  actions: preferencesActions,
} = createSlice({
  name: 'preferences',
  initialState: {},
  reducers: {
    updateLogo: (state, { payload }) => {
      console.count('preferencesReducers/updateLogo')
      return {
        ...state,
        logoUrl: payload.logoUrl,
      }
    },
    resetGlobalPrefs: (state) => {
      console.count('preferencesReducers/resetGlobalPrefs')
      return {
        ...state,
        logoUrl: '',
      }
    },
    updatePrefs: (state, { payload }: PayloadAction<PreferencesState>) => {
      console.count('preferencesReducers/updatePrefs')
      const path = Array.isArray(payload.key)
        ? [payload.username].concat(payload.key)
        : [payload.username, payload.key]
      return over(lensPath(path), mergeLeft(payload.prefs), state)
    },
  },
})

export { preferencesStoreKey, preferencesActions }
export default preferencesReducers
