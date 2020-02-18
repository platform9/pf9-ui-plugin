import React from 'react'

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import defaultThemeJson from 'core/themes/defaultTheme'

const theme = createMuiTheme(defaultThemeJson as any)

interface TestThemeProviderProps {
  children: any
}

const TestThemeProvider: React.FC<TestThemeProviderProps> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

export default TestThemeProvider
