import React from 'react'
import { withStyles } from '@material-ui/styles'
import Button from 'core/elements/button'
import FontAwesomeIcon from '../FontAwesomeIcon'

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
      <FontAwesomeIcon className={classes.leftIcon}>arrow-left</FontAwesomeIcon>
      {children || 'Back'}
    </Button>
  )
}

export default withStyles(styles)(PrevButton)
