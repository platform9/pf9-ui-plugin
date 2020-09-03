import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import defaultTheme from 'core/themes/defaultTheme'
import * as CSS from 'csstype'
import React, { useEffect, useMemo, useState, useCallback, useContext } from 'react'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { AppTheme } from 'core/themes/model'
import { Theme } from '@material-ui/core/styles/createMuiTheme'

const CustomThemeContext = React.createContext<{
  theme: Theme
  setCustomTheme: (theme: AppTheme) => void
}>({
  theme: null,
  setCustomTheme: (theme) => {
    throw new Error('CustomThemeProvider not found')
  },
})

export const CustomThemeConsumer = CustomThemeContext.Consumer
export const CustomThemeProvider = CustomThemeContext.Provider

export const loadingStyles: CSS.Properties = {
  width: '100%',
  fontSize: '20px',
  textAlign: 'center',
  marginTop: '4rem',
}

const ThemeManager = ({ children }) => {
  const [{ themeName = 'default' }] = useScopedPreferences()
  const [jsonTheme, setJsonTheme] = useState<AppTheme>(defaultTheme)
  const setCustomTheme = useCallback<(theme: AppTheme) => void>(
    (customTheme: AppTheme) => {
      setJsonTheme({ ...jsonTheme, ...customTheme })
    },
    [jsonTheme],
  )

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const jsonTheme =
          themeName !== 'default' ? await import(`core/themes/${themeName}.json`) : defaultTheme
        if (!jsonTheme) {
          console.error(`Unable to load ${themeName}.json`)
          return
        }
        console.info(`Loaded ${themeName}.json`)

        setJsonTheme(jsonTheme)
      } catch (err) {
        console.error(err)
      }
    }
    loadTheme()
  }, [themeName])

  // Rendering the app before the theme is loaded will have issues because `withStyles`
  // requires the `theme` object to exist.
  if (!jsonTheme) {
    return <h2 style={loadingStyles}>Loading theme...</h2>
  }
  // TODO: Our current theme (AppTheme) is not extending the MUI theme correctly
  // Until we fix it we have to trick the TS engine to swallow this
  const theme = useMemo(() => createMuiTheme(jsonTheme as unknown), [jsonTheme])

  return (
    <ThemeProvider theme={theme}>
      <CustomThemeProvider value={{ theme, setCustomTheme }}>{children}</CustomThemeProvider>
    </ThemeProvider>
  )
}

export const useCustomTheme = () => {
  const { theme, setCustomTheme } = useContext(CustomThemeContext)
  return [theme, setCustomTheme]
}

export const withCustomTheme = (Component) => (props) => (
  <CustomThemeConsumer>
    {({ theme, setCustomTheme }) => (
      <Component {...props} theme={theme} setCustomTheme={setCustomTheme} />
    )}
  </CustomThemeConsumer>
)

export default ThemeManager
