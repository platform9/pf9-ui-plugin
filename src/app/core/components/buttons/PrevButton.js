import React from 'react'
import Icon from '@material-ui/core/Icon'
import { withStyles } from '@material-ui/styles'
import Button from 'core/elements/button'

const styles = (theme) => ({
  baseButton: {
    margin: theme.spacing(1),
    borderRadius: 2,
    textTransform: 'none',
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
})

const PrevButton = ({ children, classes, disabled, ...rest }) => {
  const params = {
    className: classes.baseButton,
    disabled,
    ...rest,
  }

  return (
    <Button {...params} disabled={disabled} color="secondary">
      <Icon className={classes.leftIcon}>arrow_back</Icon>
      {children || 'Back'}
    </Button>
  )
}

export default withStyles(styles)(PrevButton)
