import { generateTheme } from './helpers'

export const colors = {
  grey: {
    '000': '#ffffff',
    '100': '#f5f5f9',
    '200': '#e6e6ea',
    '300': '#b6b6c0',
    '500': '#868696',
    '700': '#3d3d57',
    '800': '#25253f',
    '900': '#0d0d28',
  },
  blue: {
    '100': '#f3fbfe',
    '200': '#cceffc',
    '300': '#82d4f2',
    '500': '#00abe8',
    '700': '#0089c7',
    '900': '#005992',
  },
  pink: {
    '300': '#f26aa6',
    '500': '#d82071',
    '700': '#8a003c',
    '900': '#6d0030',
  },
  yellow: {
    '300': '#ffd7a2',
    '500': '#ffbf26',
    '700': '#f0aa00',
    '900': '#bf8700',
  },
  k8sBlue: {
    '300': '#9bacfd',
    '500': '#3e5ff5',
    '700': '#011ea4',
    '900': '#001782',
  },
  osRed: {
    '300': '#ff9f8e',
    '500': '#ff4826',
    '700': '#f02500',
    '900': '#bf1e00',
  },
  green: {
    '500': '#0edf79',
  },
  red: {
    '500': '#fc4646',
  },
  orange: {
    '500': '#ff8a00',
  },
  aws: {
    300: '#FFB74D',
    500: '#FF9800',
    700: '#F57C00',
  },
  azure: {
    300: '#AEE0FF',
    500: '#4AA3DF',
    700: '#1E699C',
  },
}
const components = {
  header: {
    background: colors.grey[900],
  },
  sidebar: {
    background: colors.grey[800],
    activeBackground: colors.grey['000'],
    text: colors.grey[200],
    activeText: '#000000',
    hoverText: '#000000',
  },
  dashboardCard: {
    background: '#FFF',
    primary: '#4AA3DF',
    text: '#606060',
    icon: '#B7B7B7',
    button: '#FFF',
    divider: '#DDDDDD',
  },
  card: {
    background: 'rgba(2, 194, 172, 0.1)',
    status: '#F3F3F3',
  },
  wizard: {
    dark: '#02C2AC',
    light: 'rgba(2, 194, 172, 0.2)',
    medium: 'rgba(2, 194, 172, 0.4)',
  },
  code: {
    background: colors.blue[100],
    text: colors.blue[700],
  },
  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
    contrastText: '#FFF',
  },
  warning: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
  },
  success: {
    light: '#81C784',
    main: '#4ADF74',
    dark: '#388E3C',
  },
  upgrade: {
    main: '#D82071',
  },
}
export const typography = {
  h1: {
    fontFamily: 'Eina04',
    fontSize: '50px',
    fontWeight: 'bold',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.24',
    letterSpacing: '-0.5px',
  },
  h2: {
    fontFamily: 'Eina04',
    fontSize: '37px',
    fontWeight: 'bold',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.46',
    letterSpacing: '-0.37px',
  },
  h3: {
    fontFamily: 'Eina04',
    fontSize: '28px',
    fontWeight: 'bold',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.5',
    letterSpacing: '-0.28px',
  },
  subtitle1: {
    fontFamily: 'Eina04',
    fontSize: '21px',
    fontWeight: 600,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.43',
    letterSpacing: '-0.21px',
  },
  inputPlaceholder: {
    fontFamily: 'Eina04',
    fontSize: '18px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.11',
    letterSpacing: '-0.3px',
  },
  subtitle2: {
    fontFamily: 'Eina04',
    fontSize: '16px',
    fontWeight: 600,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.5',
    letterSpacing: '-0.16px',
  },
  nav: {
    fontFamily: 'Eina04',
    fontSize: '16px',
    fontWeight: 600,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'normal',
  },
  buttonPrimary: {
    fontFamily: 'Eina04',
    fontSize: '16px',
    fontWeight: 600,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0.18px',
  },
  body1: {
    fontFamily: 'Eina04',
    fontSize: '16px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.88',
    letterSpacing: 'normal',
  },
  h4: {
    fontFamily: 'Eina04',
    fontSize: '14px',
    fontWeight: 600,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'normal',
  },
  caption1: {
    fontFamily: 'Eina04',
    fontSize: '14px',
    fontWeight: 600,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'normal',
  },

  buttonSecondary: {
    fontFamily: 'Eina04',
    fontSize: '14px',
    fontWeight: 600,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0.16px',
  },

  inputTable: {
    fontFamily: 'Eina04',
    fontSize: '14px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.43',
    letterSpacing: '-0.23px',
  },
  body2: {
    fontFamily: 'Eina04',
    fontSize: '14px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'normal',
  },
  sidenav: {
    fontFamily: 'Eina04',
    fontSize: '13px',
    fontWeight: 600,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '-0.2px',
  },
  inputLabel: {
    fontFamily: 'Eina04',
    fontSize: '12px',
    fontWeight: 600,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '-0.2px',
  },
  caption2: {
    fontFamily: 'Eina04',
    fontSize: '12px',
    fontWeight: 600,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.67',
    letterSpacing: '-0.12px',
  },
  caption4: {
    fontFamily: 'Eina04',
    fontSize: '11px',
    fontWeight: 600,
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '-0.11px',
  },
  caption3: {
    fontFamily: 'Eina04',
    fontSize: '11px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '-0.11px',
  },
}

const relianceLightTheme = generateTheme({
  palette: { colors, primary: 'blue', secondary: 'pink', type: 'light' },
  typography: {
    fontFamily: '"Eina04"',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    typography,
  },
  components,
})
// relianceLightTheme.palette.
export default relianceLightTheme
