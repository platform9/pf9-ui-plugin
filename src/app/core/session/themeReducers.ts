import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ThemeReducer } from 'app/plugins/account/components/theme/model'
import { generateComponentColors } from 'core/themes/helpers'
import { mergeLeft } from 'ramda'
import defaultTheme from 'core/themes/relianceLight'

export const defaultThemeState: ThemeReducer = {
  theme: null,
  components: null,
}

interface UpdateComponentAction {
  components: ComponentPayload[]
}

interface ComponentPayload {
  pathTo: string[]
  value: string
}

const { name: customThemeKey, reducer: themeReducers, actions: themeActions } = createSlice({
  name: 'theme',
  initialState: defaultThemeState,
  reducers: {
    updateThemeComponent: (state, { payload }: PayloadAction<UpdateComponentAction>) => {
      console.count('themeReducers/updateThemeComponent')
      return { ...state, components: generateComponentColors(payload, state.components) }
    },
    // @ts-ignore
    updateTheme: (state, { payload }: PayloadAction<Partial<ThemeReducer>>) => {
      console.count('themeReducers/updateTheme')
      return mergeLeft(payload, state)
    },
    clearTheme: () => {
      console.count('themeReducers/clearTheme')
      return defaultTheme
    },
  },
})

export { customThemeKey, themeActions }
export default themeReducers
