import { deepOrange } from '@material-ui/core/colors'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import React from 'react'

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
    secondary: deepOrange,
  },
})

export const withAppTheme = Component => props =>
  <ThemeProvider theme={theme}>
    <Component {...props} />
  </ThemeProvider>

export default theme
