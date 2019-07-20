import React, { useContext, useEffect } from 'react'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import { Context } from 'core/AppContext'
import defaultThemeJson from 'core/themes/default.json'

// TODO: use PreferencesProvider to pick the user specific theme
const ThemeManager = ({ children, themeName = 'default' }) => {
  const context = useContext(Context)

  useEffect(() => {
    const themeJson = context.themeJson || defaultThemeJson
    context.setContext({
      theme: createMuiTheme(themeJson),
      themeJson,
    })
    const loadTheme = async themeName => {
      try {
        const jsonTheme = await import(`core/themes/${themeName}.json`)
        if (!jsonTheme) { console.error(`Unable to load ${themeName}.json`) }
        if (jsonTheme) { console.info(`Loaded ${themeName}.json`) }
        context.setContext({
          theme: createMuiTheme(jsonTheme),
          themeJson: jsonTheme,
        })
      } catch (err) {
        console.log(err)
      }
    }
    if (themeName !== 'default') {
      return loadTheme()
    }
  }, [themeName])

  const { theme } = context

  // Rendering the app before the theme is loaded will have issues because `withStyles`
  // requires the `theme` object to exist.
  if (!theme) { return <div>Loading theme...</div> }

  return (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  )
}

export default ThemeManager
