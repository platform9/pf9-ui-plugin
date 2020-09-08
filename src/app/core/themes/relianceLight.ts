const defaultTheme = {
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
  palette: {
    gray: {
      '000': '#ffffff',
      '100': '#f5f5f9',
      '200': '#e6e6ea',
      '300': '#b6b6c0',
      '500': '#868696',
      main: '#868696',
      '700': '#3d3d57',
      '800': '#25253f',
      '900': '#0d0d28',
    },
    black: {
      main: '#000000',
    },
    blue: {
      '100': '#f3fbfe',
      '200': '#cceffc',
      '300': '#82d4f2',
      '500': '#00abe8',
      main: '#00abe8',
      '700': '#0089c7',
      '900': '#005992',
    },
    pink: {
      '300': '#f26aa6',
      '500': '#d82071',
      main: '#d82071',
      '700': '#8a003c',
      '900': '#6d0030',
    },
    yellow: {
      '300': '#ffd7a2',
      '500': '#ffbf26',
      main: '#ffbf26',
      '700': '#f0aa00',
      '900': '#bf8700',
    },
    k8sBlue: {
      '300': '#9bacfd',
      '500': '#3e5ff5',
      main: '#3e5ff5',
      '700': '#011ea4',
      '900': '#001782',
    },
    osRed: {
      '300': '#ff9f8e',
      '500': '#ff4826',
      main: '#ff4826',
      '700': '#f02500',
      '900': '#bf1e00',
    },
    green: {
      '500': '#0edf79',
      main: '#0edf79',
    },
    red: {
      '500': '#fc4646',
      main: '#fc4646',
    },
    common: {
      black: '#000000',
      white: '#ffffff',
    },
    primary: {
      main: '#00ABE8',
      100: '#f3fbfe',
      200: '#cceffc',
      300: '#82D4F2',
      500: '#00ABE8',
      700: '#0089C7',
      900: '#005992',
    },
    secondary: {
      main: '#d82071',
      300: '#f26aa6',
      500: '#d82071',
      700: '#8a003c',
      900: '#6d0030',
    },
    type: 'light',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    Heading1: {
      fontFamily: 'Eina04',
      fontSize: '50px',
      fontWeight: 'bold',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '1.24',
      letterSpacing: '-0.5px',
    },
    Heading2: {
      fontFamily: 'Eina04',
      fontSize: '37px',
      fontWeight: 'bold',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '1.46',
      letterSpacing: '-0.37px',
    },
    Heading3: {
      fontFamily: 'Eina04',
      fontSize: '28px',
      fontWeight: 'bold',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '1.5',
      letterSpacing: '-0.28px',
    },
    Sub1: {
      fontFamily: 'Eina04',
      fontSize: '21px',
      fontWeight: '600',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '1.43',
      letterSpacing: '-0.21px',
    },
    InputPlaceholder: {
      fontFamily: 'Eina04',
      fontSize: '18px',
      fontWeight: 'normal',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '1.11',
      letterSpacing: '-0.3px',
    },
    Sub2: {
      fontFamily: 'Eina04',
      fontSize: '16px',
      fontWeight: '600',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '1.5',
      letterSpacing: '-0.16px',
      textAlign: 'center',
    },
    Nav: {
      fontFamily: 'Eina04',
      fontSize: '16px',
      fontWeight: '600',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
    ButtonPrimary: {
      fontFamily: 'Eina04',
      fontSize: '16px',
      fontWeight: '600',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: '0.18px',
      textAlign: 'center',
    },
    Body1: {
      fontFamily: 'Eina04',
      fontSize: '16px',
      fontWeight: 'normal',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '1.88',
      letterSpacing: 'normal',
    },
    Heading4: {
      fontFamily: 'Eina04',
      fontSize: '14px',
      fontWeight: '600',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
    Caption1: {
      fontFamily: 'Eina04',
      fontSize: '14px',
      fontWeight: '600',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textAlign: 'right',
    },

    ButtonSecondary: {
      fontFamily: 'Eina04',
      fontSize: '14px',
      fontWeight: '600',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: '0.16px',
      textAlign: 'center',
    },

    InputTable: {
      fontFamily: 'Eina04',
      fontSize: '14px',
      fontWeight: 'normal',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '1.43',
      letterSpacing: '-0.23px',
    },
    Body2: {
      fontFamily: 'Eina04',
      fontSize: '14px',
      fontWeight: 'normal',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
    Sidenav: {
      fontFamily: 'Eina04',
      fontSize: '13px',
      fontWeight: '600',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: '-0.2px',
    },
    InputLabel: {
      fontFamily: 'Eina04',
      fontSize: '12px',
      fontWeight: '600',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: '-0.2px',
    },
    Caption2: {
      fontFamily: 'Eina04',
      fontSize: '12px',
      fontWeight: '600',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '1.67',
      letterSpacing: '-0.12px',
    },
    Caption4: {
      fontFamily: 'Eina04',
      fontSize: '11px',
      fontWeight: '600',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: '-0.11px',
      textAlign: 'center',
    },
    Caption3: {
      fontFamily: 'Eina04',
      fontSize: '11px',
      fontWeight: 'normal',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: '-0.11px',
      textAlign: 'center',
    },
  },
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
}

export default defaultTheme
