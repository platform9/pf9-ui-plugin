import React, { useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import FontAwesomeIcon from './FontAwesomeIcon'
import { hexToRGBA } from 'core/utils/colorHelpers'

export const variantIcon = {
  success: 'check-circle',
  warning: 'exclamation-circle',
  error: 'exclamation-circle',
  info: 'info-circle',
}

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 800,
    position: ({ small }) => (small ? 'initial' : 'relative'),
    padding: ({ small }) => (small ? theme.spacing(2, 3) : theme.spacing(2, 8)),
    border: 0,
    display: ({ small }) => (small ? 'flex' : 'block'),
    backgroundColor: ({ type }) =>
      type === 'card'
        ? theme.palette.grey['000']
        : type === 'error'
        ? hexToRGBA(theme.palette.red[500], 0.1)
        : theme.palette.blue[100],
  },
  success: { color: theme.palette.green.main },
  error: { color: theme.palette.red.main },
  info: { color: theme.palette.blue.main },
  warning: { color: theme.palette.yellow.main },
  icon: {
    position: ({ small }) => (small ? 'initial' : 'absolute'),
    left: ({ small }) => (small ? 'initial' : theme.spacing(3)),
    top: ({ small }) => (small ? 'initial' : theme.spacing(3)),
    fontSize: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: ({ small }) => (small ? 0 : 'initial'),
    alignSelf: ({ small }) => (small ? 'center' : 'initial'),
  },
  close: {
    position: ({ small }) => (small ? 'initial' : 'absolute'),
    right: ({ small }) => (small ? 'initial' : theme.spacing(2)),
    top: ({ small }) => (small ? 'initial' : theme.spacing(1)),
    padding: theme.spacing(1),
    margin: theme.spacing(-1),
    flexGrow: ({ small }) => (small ? 0 : 'initial'),
    alignSelf: ({ small }) => (small ? 'center' : 'initial'),
    fontSize: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    color: theme.palette.blue.main,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    alignSelf: ({ small }) => (small ? 'center' : 'initial'),
    flexGrow: ({ small }) => (small ? 1 : 'initial'),
  },
}))

const Alert = ({
  id = undefined,
  className = undefined,
  children,
  message,
  variant,
  small,
  type = 'message',
  showClose,
}) => {
  const classes = useStyles({ small, type })
  const [open, setOpen] = useState(true)
  if (!open) {
    return null
  }

  return (
    <Paper id={id} className={clsx(classes.root, className)} elevation={0}>
      <FontAwesomeIcon className={clsx(classes.icon, classes.iconVariant, classes[variant])}>
        {variantIcon[variant]}
      </FontAwesomeIcon>
      {message && (
        <Text variant="body2" color="inherit" className={classes.message}>
          {message}
        </Text>
      )}
      {children}
      {showClose && (
        <FontAwesomeIcon className={classes.close} onClick={() => setOpen(false)}>
          minus-circle
        </FontAwesomeIcon>
      )}
    </Paper>
  )
}

Alert.propTypes = {
  // Use children when we want to have larger amount of text and customized rendering.
  children: PropTypes.any,

  // Use message when it is just a short string of text.
  message: PropTypes.node,
  type: PropTypes.oneOf(['card', 'message', 'error']),
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
  small: PropTypes.bool,
  showClose: PropTypes.bool,
}

Alert.defaultProps = {
  showClose: false,
}

export default Alert
