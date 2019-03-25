import React, { Component } from 'react'
import uuid from 'uuid'
import { IconButton, Snackbar } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { adjust, init, propEq } from 'ramda'
import classnames from 'classnames'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import InfoIcon from '@material-ui/icons/Info'
import CloseIcon from '@material-ui/icons/Close'
import green from '@material-ui/core/colors/green'
import amber from '@material-ui/core/colors/amber'
import WarningIcon from '@material-ui/icons/Warning'
import SnackbarContent from '@material-ui/core/SnackbarContent/SnackbarContent'

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
}

const styles = theme => ({
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
    marginRight: theme.spacing.unit,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
})

const ToastContext = React.createContext()

const toastsTimeout = 5000

const ToastContent = withStyles(styles)(({onClose, type, message, classes, className, ...rest}) => {
  const Icon = variantIcon[type]
  return <SnackbarContent
    className={classnames(classes[type], className)}
    aria-describedby="client-snackbar"
    message={
      <span id="client-snackbar" className={classes.message}>
        <Icon className={classnames(classes.icon, classes.iconVariant)} />
        {message}
      </span>
    }
    action={[
      <IconButton
        key="close"
        aria-label="Close"
        color="inherit"
        className={classes.close}
        onClick={onClose}
      >
        <CloseIcon className={classes.icon} />
      </IconButton>,
    ]}
    {...rest}
  />
})

export class ToastProvider extends Component {
  state = {
    toasts: []
  }

  showToast = (text, type = 'info') => this.setState(prevState => {
    setTimeout(this.removeLastToast, toastsTimeout + 2000)
    const id = uuid.v4()
    return ({
      toasts: [{
        id,
        text,
        type,
        isOpen: true,
        onClose: this.dismissToast(id)
      }, ...prevState.toasts ],
    })
  })

  dismissToast = id => () => {
    this.setState(({toasts, ...prevState}) => ({
      ...prevState,
      toasts: adjust(
        toasts.findIndex(propEq('id', id)),
        message => ({
          ...message,
          isOpen: false
        }),
        toasts)
    }))
  }

  removeLastToast = () => {
    this.setState(prevState => ({
      ...prevState,
      toasts: init(prevState.toasts)
    }))
  }

  render () {
    const { children } = this.props
    const { toasts } = this.state
    return (
      <ToastContext.Provider value={this.showToast}>
        {toasts.map(({id, isOpen, text, onClose, type}) =>
          <Snackbar
            key={id}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={isOpen}
            autoHideDuration={toastsTimeout}
            onClose={onClose}>
            <ToastContent onClose={onClose} type={type} message={text} />
          </Snackbar>)}
        {children}
      </ToastContext.Provider>
    )
  }
}

export const withToast = Component => props =>
  <ToastContext.Consumer>
    {
      showToast => <Component {...props} showToast={showToast} />
    }
  </ToastContext.Consumer>
