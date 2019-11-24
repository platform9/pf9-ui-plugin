import React, { FunctionComponent, useEffect } from 'react'
import clsx from 'clsx'
import { IconButton, SnackbarContent, Theme } from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import InfoIcon from '@material-ui/icons/Info'
import CloseIcon from '@material-ui/icons/Close'
import green from '@material-ui/core/colors/green'
import amber from '@material-ui/core/colors/amber'
import WarningIcon from '@material-ui/icons/Warning'
import { makeStyles } from '@material-ui/styles'
import { split, reject, pipe, map, toPairs } from 'ramda'
import { isNilOrEmpty } from 'utils/fp'

export enum MessageTypes {
  success = 'success',
  warning = 'warning',
  error = 'error',
  info = 'info'
}

const variantIcon = {
  [MessageTypes.success]: CheckCircleIcon,
  [MessageTypes.warning]: WarningIcon,
  [MessageTypes.error]: ErrorIcon,
  [MessageTypes.info]: InfoIcon,
}

interface ToastItemProps {
  message: string
  variant: MessageTypes
  onClose: () => void
  toastsTimeout: number

  [key: string]: any // ...rest props
}

const useStyles = makeStyles<Theme>(theme => ({
  content: {
    display: 'flex',
    flexFlow: 'row nowrap',
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
  close: {}
}))

const renderMessages = pipe(
  split('\n'),
  reject(isNilOrEmpty),
  toPairs,
  map(([key, i]) => <div key={key}>{i}</div>),
)

const ToastItem: FunctionComponent<ToastItemProps> = ({ message, variant, toastsTimeout, onClose, className, ...rest }) => {
  const classes = useStyles({})
  const Icon = variantIcon[variant]
  useEffect(() => {
    const timeoutId = setTimeout(onClose, toastsTimeout + 2000)
    return () => clearTimeout(timeoutId)
  }, [])

  return <SnackbarContent
    className={clsx(classes.content, classes[variant], className)}
    message={
      <span className={classes.message}>
        <Icon className={clsx(classes.icon, classes.iconVariant)} />
        <div className={classes.text}>
          {renderMessages(message)}
        </div>
      </span>
    }
    action={
      <IconButton
        key="close"
        aria-label="Close"
        color="inherit"
        size="small"
        className={classes.close}
        onClick={onClose}
      >
        <CloseIcon className={classes.icon} />
      </IconButton>}
    {...rest}
  />
}

export default ToastItem
