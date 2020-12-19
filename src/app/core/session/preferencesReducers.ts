import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { mergeLeft, over, lensPath } from 'ramda'

export interface PreferencesState {
  username: string
  key: string
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
    updatePrefs: (state, { payload }: PayloadAction<PreferencesState>) => {
      return over(lensPath([payload.username, payload.key]), mergeLeft(payload.prefs), state)
    },
    updateAllPrefs: (state, { payload }: PayloadAction<PreferencesState>) => {
      const { username, ...prefs } = payload
      return over(lensPath([payload.username]), mergeLeft(prefs), state)
    },
  },
})

export { preferencesStoreKey, preferencesActions }
export default preferencesReducers
