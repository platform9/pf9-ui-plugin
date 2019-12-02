import React, { useContext, useEffect } from 'react'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import { AppContext } from 'core/providers/AppProvider'
import defaultThemeJson from 'core/themes/defaultTheme'

const loadingStyles = { width: '100%', fontSize: '20px', textAlign: 'center', marginTop: '4rem' }

// TODO: use PreferencesProvider to pick the user specific theme
const ThemeManager = ({ children, themeName = 'default' }) => {
  const { setContext, themeJson: currThemeJson, theme } = useContext(AppContext)

  useEffect(() => {
    const themeJson = currThemeJson || defaultThemeJson
    setContext({
      theme: createMuiTheme(themeJson),
      themeJson,
    })
    const loadTheme = async name => {
      try {
        const jsonTheme = await import(`core/themes/${name}.json`)
        if (!jsonTheme) { console.error(`Unable to load ${name}.json`) }
        if (jsonTheme) { console.info(`Loaded ${name}.json`) }
        setContext({
          theme: createMuiTheme(jsonTheme),
          themeJson: jsonTheme,
        })
      } catch (err) {
        console.log(err)
      }
    }
    if (themeName !== 'default') {
      loadTheme(themeName)
    }
  }, [themeName])

  // Rendering the app before the theme is loaded will have issues because `withStyles`
  // requires the `theme` object to exist.
  if (!theme) { return <h2 style={loadingStyles}>Loading theme...</h2> }

  return (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  )
}

export default ThemeManager
