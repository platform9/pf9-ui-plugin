import React from 'react'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import { deepOrange } from '@material-ui/core/colors'

const theme = createMuiTheme({
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
    secondary: deepOrange
  }
})

export const withTheme = Component => props =>
  <MuiThemeProvider theme={theme}>
    <Component {...props} />
  </MuiThemeProvider>

export default theme
