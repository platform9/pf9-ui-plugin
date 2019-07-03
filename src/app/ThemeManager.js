import React, { useContext, useEffect } from 'react'
import axios from 'axios'
import { deepOrange } from '@material-ui/core/colors'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import { Context } from 'core/AppContext'

const defaultThemeJson = {
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      light: '#aee0ff',
      main: '#4aa3df',
      dark: '#1e699c',
      contrastText: '#fff',
    },
    secondary: deepOrange,
    sidebar: {
      background: '#243748',
      text: '#aee0ff',
    }
  },
  overrides: {
    MuiOutlinedInput: {
      root: {
        marginBottom: '16px',
      },
    },
  },
}

const ThemeManager = ({ children }) => {
  const context = useContext(Context)
  const themeJson = context.themeJson || defaultThemeJson

  useEffect(() => {
    const theme = createMuiTheme(themeJson)
    context.setContext({ theme, themeJson })

    const loadTheme = async () => {
      try {
        const response = await axios.get('/ui/theme.json')
        const loadedTheme = response.data
        if (!loadedTheme) { console.error('Unable to load theme.json') }
        if (loadedTheme) { console.info('Loaded theme.json') }
        context.setContext({
          theme: createMuiTheme(loadedTheme),
          themeJson: loadedTheme,
        })
      } catch (err) {
        console.log(err)
      }
    }
    loadTheme()
  }, [])

  const theme = context.theme

  // Rendering the app before the theme is loaded will have issues because `withStyles`
  // requires the `theme` object to exist.
  if (!theme) { return <div>Loading theme...</div> }

  // Storybook will not work unless you include BOTH (yes BOTH) the new way and the
  // deprecated way.  But for some reason it works fine in the normal app with just
  // ThemeProvider.
  // https://github.com/mui-org/material-ui/issues/14078
  return (
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </MuiThemeProvider>
  )
}

export default ThemeManager
