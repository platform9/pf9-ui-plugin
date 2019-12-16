import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import defaultTheme from 'core/themes/defaultTheme'

// FIXME: fix defaultTheme typings to allow using ThemeOptions
// type ThemeType = ThemeOptions
interface ThemeType {
  [key: string]: any
}

export const initialState: ThemeType = defaultTheme

const {
  name: themeStoreKey,
  reducer: themeReducers,
  actions: themeActions,
} = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (
      state,
      { payload }: PayloadAction<ThemeType>) => {
      return payload
    },
  },
})

export { themeStoreKey, themeActions }
export default themeReducers
