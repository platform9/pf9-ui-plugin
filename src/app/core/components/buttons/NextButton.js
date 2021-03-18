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
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
})

const NextButton = ({ children, classes, disabled, showForward = true, ...rest }) => {
  const params = {
    className: classes.baseButton,
    disabled,
    ...rest,
  }

  return (
    <Button {...params} disabled={disabled}>
      {children || 'Next'}
      {showForward && <FontAwesomeIcon className={classes.rightIcon}>arrow-right</FontAwesomeIcon>}
    </Button>
  )
}

export default withStyles(styles)(NextButton)
