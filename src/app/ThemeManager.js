import React from 'react'
import { withAppContext } from 'core/AppContext'
import { deepOrange } from '@material-ui/core/colors'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'

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

class ThemeManager extends React.Component {
  getThemeJson = () => this.props.context.themeJson || defaultThemeJson

  componentDidMount () {
    const themeJson = this.getThemeJson()
    const theme = createMuiTheme(themeJson)
    this.props.setContext({ theme, themeJson })
  }

  render () {
    const { children, context } = this.props
    const theme = context.theme
    return theme
      ? <ThemeProvider theme={theme}>{children}</ThemeProvider>
      // Rendering the app before the theme is loaded will have issues because `withStyles`
      // requires the `theme` object to exist.
      : <div>Loading theme...</div>
  }
}

export default withAppContext(ThemeManager)
