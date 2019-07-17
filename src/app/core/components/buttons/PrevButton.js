import React from 'react'
import Button from '@material-ui/core/Button'
import Icon from '@material-ui/core/Icon'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  baseButton: {
    margin: theme.spacing.unit * 1,
    borderRadius: 2,
  },
  leftIcon: {
    marginRight: theme.spacing.unit * 1
  },
})

const PrevButton = ({ children, classes, disabled, ...rest }) => {
  const params = {
    className: classes.baseButton,
    color: disabled ? 'primary' : 'primary',
    variant: 'outlined',
    disabled,
    ...rest,
  }

  return (
    <Button {...params}>
      <Icon className={classes.leftIcon}>arrow_back</Icon>
      {children || 'Back'}
    </Button>
  )
}

export default withStyles(styles)(PrevButton)
