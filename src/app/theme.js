import React from 'react'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#aee0ff',
      main: '#4aa3df',
      dark: '#1e699c',
      contrastText: '#fff',
    }
  }
})

export const withTheme = Component => props =>
  <MuiThemeProvider theme={theme}>
    <Component {...props} />
  </MuiThemeProvider>

export default theme
