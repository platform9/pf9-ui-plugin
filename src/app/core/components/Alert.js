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
    position: 'relative',
    padding: theme.spacing(1, 8),
    margin: theme.spacing(2, 0),
    width: '100%',
    border: 0,
  },
  success: { color: green[600] },
  error: { color: theme.palette.error.dark },
  info: { color: theme.palette.primary.dark },
  warning: { color: amber[700] },
  icon: {
    position: 'absolute',
    left: theme.spacing(2),
    top: theme.spacing(1),
    fontSize: 28,
  },
  close: {
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(1),
    padding: theme.spacing(1),
    margin: theme.spacing(-1),
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}))

const Alert = ({ children, message, variant }) => {
  const classes = useStyles()
  const [open, setOpen] = useState(true)
  if (!open) { return null }
  const Icon = variantIcon[variant]

  return (
    <Paper className={classes.root}>
      <Icon className={clsx(classes.icon, classes.iconVariant, classes[variant])} />
      {message && <Typography variant="body1" color="inherit">{message}</Typography>}
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
