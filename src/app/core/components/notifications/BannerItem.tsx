import { MessageTypes } from 'core/components/notifications/model'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import WarningIcon from '@material-ui/icons/Warning'
import ErrorIcon from '@material-ui/icons/Error'
import InfoIcon from '@material-ui/icons/Info'
import { makeStyles, ThemeProvider } from '@material-ui/styles'
import { createMuiTheme, IconButton, Theme } from '@material-ui/core'
import green from '@material-ui/core/colors/green'
import amber from '@material-ui/core/colors/amber'
import React, { FunctionComponent } from 'react'
import clsx from 'clsx'
import CloseIcon from '@material-ui/icons/Close'

const variantIcon = {
  [MessageTypes.success]: CheckCircleIcon,
  [MessageTypes.warning]: WarningIcon,
  [MessageTypes.error]: ErrorIcon,
  [MessageTypes.info]: InfoIcon,
}

interface BannerItemProps {
  variant: MessageTypes
  onClose: () => void

  [key: string]: any // ...rest props
}

const useStyles = makeStyles<Theme>(theme => ({
  content: {
    height: 30,
    display: 'flex',
    flexFlow: 'row nowrap',
    textAlign: 'center',
    color: theme.palette.secondary.contrastText,
    justifyContent: 'center',
    width: '100%',
  },
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
  text: {
    display: 'inline-block',
  },
  close: {
    position: 'absolute',
    right: 0,
  },
}))

// Color overrides for links and other elements depending on the current banner type
// TODO: Fix these colors when we have the definitive designs
const variantThemes = {
  [MessageTypes.success]: {
    palette: {
      primary: {
        light: '#AEE0FF',
        main: '#4AA3DF',
        dark: '#1E699C',
        contrastText: '#FFF',
      },
    },
  },
  [MessageTypes.warning]: {
    palette: {
      primary: {
        light: '#AEE0FF',
        main: '#4AA3DF',
        dark: '#1E699C',
        contrastText: '#FFF',
      },
    },
  },
  [MessageTypes.error]: {
    palette: {
      primary: {
        light: '#AEE0FF',
        main: '#4AA3DF',
        dark: '#1E699C',
        contrastText: '#FFF',
      },
    },
  },
  [MessageTypes.info]: {
    palette: {
      primary: {
        light: '#ffbe00',
        main: '#FF8D00',
        dark: '#dd7000',
        contrastText: '#f4fff3',
      },
    },
  },
}

const BannerItem: FunctionComponent<BannerItemProps> = ({ children, variant, onClose, className, ...rest }) => {
  const classes = useStyles({})
  const Icon = variantIcon[variant]
  const contentTheme = React.useMemo(() => createMuiTheme(variantThemes[variant]), [variant])

  return <div className={clsx(classes.content, classes[variant], className)}>
    <IconButton
      key="close"
      aria-label="Close"
      color="inherit"
      size="small"
      onClick={onClose}
      className={classes.close}
    >
      <CloseIcon className={classes.icon} />
    </IconButton>
    <span className={classes.message}>
      <Icon className={clsx(classes.icon, classes.iconVariant)} />
      <div className={classes.text}>
        <ThemeProvider theme={contentTheme}>
          {children}
        </ThemeProvider>
      </div>
    </span>
  </div>
}

export default BannerItem
