import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import InfoIcon from '@material-ui/icons/Info'
import CloseIcon from '@material-ui/icons/Close'
import green from '@material-ui/core/colors/green'
import amber from '@material-ui/core/colors/amber'
import IconButton from '@material-ui/core/IconButton'
import WarningIcon from '@material-ui/icons/Warning'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
}

const styles = theme => ({
  success: { backgroundColor: green[600] },
  error: { backgroundColor: theme.palette.error.dark },
  info: { backgroundColor: theme.palette.primary.dark },
  warning: { backgroundColor: amber[700] },
  icon: { fontSize: 20 },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit
  },
  message: {
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    color: theme.palette.primary.contrastText,
    display: 'flex',
    justifyContent: 'space-between',
    margin: `${theme.spacing.unit}px 0`,
    padding: theme.spacing.unit,
    width: '100%',
  }
})

@withStyles(styles)
class Alert extends React.Component {
  state = { open: true }

  onClose = () => { this.setState({ open: false })}
  render () {
    if (!this.state.open) { return null }

    const { classes, message, variant } = this.props
    const Icon = variantIcon[variant]

    return (
      <div className={classNames(classes.container, classes[variant])}>
        <span className={classes.message}>
          <Icon className={classNames(classes.icon, classes.iconVariant)} />
          <Typography variant="body1" color="inherit">{message}</Typography>
        </span>
        <IconButton
          key='close'
          aria-label='Close'
          color='inherit'
          className={classes.close}
          onClick={this.onClose}
        >
          <CloseIcon className={classes.icon} />
        </IconButton>
      </div>
    )
  }
}

Alert.propTypes = {
  message: PropTypes.node,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
}

export default Alert
