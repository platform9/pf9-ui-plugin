import React from 'react'
import Button from '@material-ui/core/Button'
import Icon from '@material-ui/core/Icon'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  baseButton: {
    margin: theme.spacing.unit * 1,
    borderRadius: 2,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit * 1
  },
})

const NextButton = ({ children, classes, disabled, ...rest }) => {
  const params = {
    className: classes.baseButton,
    color: disabled ? 'primary' : 'primary',
    variant: 'contained',
    disabled,
    ...rest,
  }

  return (
    <Button {...params}>
      <Icon className={classes.rightIcon}>arrow_forward</Icon>
      {children || 'Next'}
    </Button>
  )
}

export default withStyles(styles)(NextButton)
