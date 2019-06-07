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
      light: '#AEE0FF',
      main: '#4AA3DF',
      dark: '#1E699C',
      contrastText: '#FFF',
    },
    secondary: deepOrange,
  },
  overrides: {
    MuiTableCell: {
      root: {
        padding: '4px 24px',
      },
    },
    MuiInputBase: {
      root: {
        color: 'inherit',
      },
    },
    MuiOutlinedInput: {
      root: {
        padding: '3px 0',
      },
      input: {
        padding: '5px 3px',
      },
      adornedStart: {
        paddingLeft: 8,
      },
      adornedEnd: {
        paddingRight: 8,
      },
    },
  },
})

export const withAppTheme = Component => props =>
  <ThemeProvider theme={theme}>
    <Component {...props} />
  </ThemeProvider>

export default theme
