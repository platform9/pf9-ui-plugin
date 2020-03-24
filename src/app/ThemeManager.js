import React, { useEffect, useMemo } from 'react'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import { prop } from 'ramda'
import defaultTheme from 'core/themes/defaultTheme'
import { useDispatch, useSelector } from 'react-redux'
import { themeStoreKey, themeActions } from 'core/themes/themeReducers'

const loadingStyles = { width: '100%', fontSize: '20px', textAlign: 'center', marginTop: '4rem' }

const ThemeManager = ({ children, themeName = 'default' }) => {
  const theme = useSelector(prop(themeStoreKey))
  const dispatch = useDispatch()
  useEffect(() => {
    const loadTheme = async name => {
      try {
        const jsonTheme = await import(`core/themes/${name}.json`)
        if (!jsonTheme) { console.error(`Unable to load ${name}.json`) }
        if (jsonTheme) { console.info(`Loaded ${name}.json`) }
        dispatch(themeActions.setTheme(jsonTheme))
      } catch (err) {
        console.error(err)
      }
    }
    if (themeName !== 'default') {
      loadTheme(themeName)
    } else if (theme !== defaultTheme) {
      dispatch(themeActions.setTheme(defaultTheme))
    }
  }, [themeName])

  const muiTheme = useMemo(() => createMuiTheme(theme), [theme])

  // Rendering the app before the theme is loaded will have issues because `withStyles`
  // requires the `theme` object to exist.
  if (!theme) { return <h2 style={loadingStyles}>Loading theme...</h2> }

  return (
    <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
  )
}

export default ThemeManager
