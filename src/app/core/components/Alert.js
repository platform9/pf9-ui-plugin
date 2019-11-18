import React, { useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { Paper, IconButton, Typography } from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import InfoIcon from '@material-ui/icons/Info'
import CloseIcon from '@material-ui/icons/Close'
import green from '@material-ui/core/colors/green'
import amber from '@material-ui/core/colors/amber'
import WarningIcon from '@material-ui/icons/Warning'
import { makeStyles } from '@material-ui/styles'

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
}

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: 800,
    position: ({ small }) => small ? 'initial' : 'relative',
    padding: ({ small }) => small ? theme.spacing(1, 1) : theme.spacing(1, 8),
    margin: theme.spacing(2, 0),
    border: 0,
    display: ({ small }) => small ? 'flex' : 'block'
  },
  success: { color: green[600] },
  error: { color: theme.palette.error.dark },
  info: { color: theme.palette.primary.dark },
  warning: { color: amber[700] },
  icon: {
    position: ({ small }) => small ? 'initial' : 'absolute',
    left: ({ small }) => small ? 'initial' : theme.spacing(2),
    top: ({ small }) => small ? 'initial' : theme.spacing(1),
    fontSize: 28,
    flexGrow: ({ small }) => small ? 0 : 'initial',
    alignSelf: ({ small }) => small ? 'center' : 'initial',
  },
  close: {
    position: ({ small }) => small ? 'initial' : 'absolute',
    right: ({ small }) => small ? 'initial' : theme.spacing(2),
    top: ({ small }) => small ? 'initial' : theme.spacing(1),
    padding: theme.spacing(1),
    margin: theme.spacing(-1),
    flexGrow: ({ small }) => small ? 0 : 'initial',
    alignSelf: ({ small }) => small ? 'center' : 'initial',
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    alignSelf: ({ small }) => small ? 'center' : 'initial',
    flexGrow: ({ small }) => small ? 1 : 'initial',
  },
}))

const Alert = ({ children, message, variant, small }) => {
  const classes = useStyles({ small })
  const [open, setOpen] = useState(true)
  if (!open) { return null }
  const Icon = variantIcon[variant]

  return (
    <Paper className={classes.root}>
      <Icon className={clsx(classes.icon, classes.iconVariant, classes[variant])} />
      {message && <Typography variant="body1" color="inherit" className={classes.message}>{message}</Typography>}
      {children}
      <IconButton
        key='close'
        aria-label='Close'
        color='inherit'
        className={classes.close}
        onClick={() => setOpen(false)}
      >
        <CloseIcon />
      </IconButton>
    </Paper>
  )
}

Alert.propTypes = {
  // Use children when we want to have larger amount of text and customized rendering.
  children: PropTypes.any,

  // Use message when it is just a short string of text.
  message: PropTypes.node,

  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
}

export default Alert
