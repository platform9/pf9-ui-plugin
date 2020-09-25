import Theme, { Components } from './model'

interface IColor {
  '000'?: string
  '100'?: string
  '200'?: string
  '300'?: string
  '400'?: string
  '500': string
  '600'?: string
  '700'?: string
  '800'?: string
  '900'?: string
}
interface IMuiBaseColors {
  light?: string
  main: string
  dark?: string
}
type IMuiColor = IColor & IMuiBaseColors

interface ThemeColors<T = IColor> {
  [key: string]: T
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
function addMuiThemeColorVars(color = {} as IColor) {
  const MuiColors: IMuiBaseColors = {
    main: color[500],
  }
  if (color[300]) {
    MuiColors.light = color[300]
  }
  if (color[700]) {
    MuiColors.dark = color[700]
  }
  return {
    ...color,
    ...MuiColors,
  }
}

interface IPalette<T> {
  primary: keyof T
  secondary: keyof T
  type: IColorPalette['type']
  colors: T
}

interface IColorPalette {
  primary: IMuiColor
  secondary: IMuiColor
  type: 'light' | 'dark'
}

export function generateColorPalette<T extends ThemeColors>({
  primary,
  secondary,
  type,
  colors,
}: {
  primary: keyof T
  secondary: keyof T
  type: IColorPalette['type']
  colors: T
}) {
  const returnColors = {
    primary: addMuiThemeColorVars(colors[primary]),
    secondary: addMuiThemeColorVars(colors[secondary]),
  }
  Object.entries(colors).forEach(([key, value]) => {
    returnColors[key] = addMuiThemeColorVars(value)
  })
  return {
    type,
    contrastThreshold: 3,
    tonalOffset: 0.2,
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.54)',
      disabled: 'rgba(0, 0, 0, 0.25)',
      hint: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    common: {
      black: '#000',
      white: '#FFF',
    },
    ...returnColors,
  }
}

interface ITypography<T> {
  fontFamily?: string
  fontSize?: number
  fontWeightLight?: number
  fontWeightRegular?: number
  fontWeightMedium?: number
  typography: T
}

export function generateTypography<T>({
  fontFamily = '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize = 14,
  fontWeightLight = 300,
  fontWeightRegular = 400,
  fontWeightMedium = 500,
  typography,
}): ITypography<T> {
  const returnTypography = typography
  return {
    fontFamily,
    fontSize,
    fontWeightLight,
    fontWeightRegular,
    fontWeightMedium,
    ...returnTypography,
  }
}

export function generateTheme<P extends ThemeColors, T>({
  palette,
  typography,
  components,
}: {
  palette: IPalette<P>
  typography: ITypography<T>
  components: Components
}): Theme {
  const MuiTypography = generateTypography<T>(typography)

  return {
    palette: generateColorPalette<P>(palette),
    typography: MuiTypography,
    components,
    breakpoints: {
      keys: ['xs', 'sm', 'md', 'lg', 'xl'],
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    direction: 'ltr',
    mixins: {
      toolbar: {
        minHeight: 56,
        '@media (min-width:0px) and (orientation: landscape)': {
          minHeight: 48,
        },
        '@media (min-width:600px)': {
          minHeight: 64,
        },
      },
    },
    overrides: {
      MuiTypography: {
        // Why doesn't this apply these as overrides?
        // ...typography.typography,
        root: {
          // this is hacky. how else do you get these elements to render correctly?
          ...Object.fromEntries(
            Object.entries(typography.typography).map(([key, value]) => [
              `&.MuiTypography-${key}`,
              value,
            ]),
          ),
        },
      },
      MuiSvgIcon: {
        root: {
          fontSize: '22px',
        },
      },
      MuiInput: {
        root: {
          fontSize: '16px',
        },
      },
      MuiInputLabel: {
        root: {
          color: '#AAA',
        },
        outlined: {
          transform: 'translate(16px, 16px) scale(1)',
        },
        shrink: {
          fontSize: '16px',
          color: '#333',
        },
      },
      MuiOutlinedInput: {
        root: {
          fontSize: '16px',
          minWidth: '120px',
        },
        input: {
          padding: '12px 16px',
        },
      },
      MuiMenuItem: {
        root: {
          fontSize: '16px',
          minHeight: '18px',
        },
      },
      MuiTooltip: {
        tooltip: {
          fontSize: 12,
          padding: '8px 12px',
        },
      },
      MuiToolbar: {
        dense: {
          height: 55,
        },
      },
      MuiButton: {
        contained: {
          boxShadow: 'none',
        },
      },
      MuiTableCell: {
        root: {
          padding: '8px',
        },
      },
      MuiDialogActions: {
        root: {
          padding: '8px 16px',
        },
      },
      MuiListItem: {
        dense: {
          paddingTop: 0,
          paddingBottom: 0,
        },
      },
      MuiListItemIcon: {
        root: {
          minWidth: 32,
        },
      },
      MuiListItemText: {
        root: {
          paddingTop: 0,
          paddingBottom: 0,
        },
      },
    },
    shadows: [
      'none',
      '0px 1px 3px 0px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 2px 1px -1px rgba(0,0,0,0.12)',
      '0px 1px 5px 0px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 3px 1px -2px rgba(0,0,0,0.12)',
      '0px 1px 8px 0px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 3px 3px -2px rgba(0,0,0,0.12)',
      '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
      '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
      '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
      '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
      '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
      '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
      '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
      '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
      '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
      '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
      '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
      '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
      '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
      '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
    ],
    shape: {
      borderRadius: 4,
    },
    spacing: 8,
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
    zIndex: {
      mobileStepper: 1000,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
    },
  } as any
}
/* 

{
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      display3: {
        fontSize: '3.5rem',
        fontWeight: 400,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        letterSpacing: '-.02em',
        lineHeight: '1.30357em',
        marginLeft: '-.02em',
        color: 'rgba(0, 0, 0, 0.54)',
      },
      display2: {
        fontSize: '2.8125rem',
        fontWeight: 400,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: '1.13333em',
        marginLeft: '-.02em',
        color: 'rgba(0, 0, 0, 0.54)',
      },
      display1: {
        fontSize: '2.125rem',
        fontWeight: 400,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: '1.20588em',
        color: 'rgba(0, 0, 0, 0.54)',
      },
      headline: {
        fontSize: '1.5rem',
        fontWeight: 400,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: '1.35417em',
        color: 'rgba(0, 0, 0, 0.87)',
      },
      title: {
        fontSize: '1.3125rem',
        fontWeight: 500,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: '1.16667em',
        color: 'rgba(0, 0, 0, 0.87)',
      },
      subheading: {
        fontSize: '1rem',
        fontWeight: 400,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: '1.5em',
        color: 'rgba(0, 0, 0, 0.87)',
      },
      body2: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 1.4,
        letterSpacing: '0.01071em',
      },
      body1: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '0.875rem',
        lineHeight: 1.5,
        letterSpacing: '0.00938em',
      },
      caption: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 1.66,
        letterSpacing: '0.03333em',
      },
      button: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.75,
        letterSpacing: '0.02857em',
        textTransform: 'none',
      },
      h1: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 300,
        fontSize: '6rem',
        lineHeight: 1,
        letterSpacing: '-0.01562em',
      },
      h2: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 300,
        fontSize: '3.75rem',
        lineHeight: 1,
        letterSpacing: '-0.00833em',
      },
      h3: {
        color: '#222',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '20px',
        lineHeight: 1.04,
        letterSpacing: '0em',
      },
      h4: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '2.125rem',
        lineHeight: 1.17,
        letterSpacing: '0.00735em',
      },
      h5: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '1.6rem',
        lineHeight: 1.33,
        letterSpacing: '0em',
      },
      h6: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.6,
        letterSpacing: '0.0075em',
      },
      subtitle1: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '1.3125rem',
        lineHeight: 1.45,
        letterSpacing: '0.00938em',
      },
      subtitle2: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.4,
        letterSpacing: '0.00714em',
      },
      body1Next: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '0.875rem',
        lineHeight: 1.5,
        letterSpacing: '0.00938em',
      },
      body2Next: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 1.5,
        letterSpacing: '0.01071em',
      },
      buttonNext: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.75,
        letterSpacing: '0.02857em',
        textTransform: 'uppercase',
      },
      captionNext: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 1.66,
        letterSpacing: '0.03333em',
      },
      overline: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 2.66,
        letterSpacing: '0.08333em',
        textTransform: 'uppercase',
      },
    },

*/

export interface Typography {
  fontFamily: string
  fontSize: number
  fontWeightLight: number
  fontWeightRegular: number
  fontWeightMedium: number
  display3: TextBase
  display2: TextBase
  display1: TextBase
  headline: TextBase
  title: TextBase
  subheading: TextBase
  body2: TextBase
  body1: TextBase
  caption: TextBase
  button: TextBase
  h1: TextBase
  h2: TextBase
  h3: TextBase
  h4: TextBase
  h5: TextBase
  h6: TextBase
  subtitle1: TextBase
  subtitle2: TextBase
  body1Next: TextBase
  body2Next: TextBase
  buttonNext: TextBase
  captionNext: TextBase
  overline: TextBase
}

export interface TextBase {
  fontFamily: string
  fontWeight: number
  fontSize: string
  lineHeight: number
  letterSpacing: string
  fontStretch?: string
  fontStyle?: string
}
