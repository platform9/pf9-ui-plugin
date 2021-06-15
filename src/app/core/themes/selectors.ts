import { customThemeKey } from 'core/session/themeReducers'
import { pathOr } from 'ramda'
import { createSelector } from 'reselect'
import { defaultThemeState } from 'core/session/themeReducers'

export const themeSelector = createSelector(
  [(state) => pathOr(defaultThemeState, [customThemeKey])(state)],
  ({ theme, components }) => {
    return {
      ...theme,
      components,
    }
  },
)
