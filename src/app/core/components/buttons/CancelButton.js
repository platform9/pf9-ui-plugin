import React from 'react'
import { withStyles } from '@material-ui/styles'
import Button from 'core/elements/button'

const styles = (theme) => ({
  baseButton: {
    margin: theme.spacing(1),
  },
})

const CancelButton = ({ children, classes, disabled, ...rest }) => {
  const params = {
    className: classes.baseButton,
    disabled,
    ...rest,
  }

  return (
    <Button className={classes.baseButton} {...params}>
      {children || 'Cancel'}
    </Button>
  )
}

export default withStyles(styles)(CancelButton)
