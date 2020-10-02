import React from 'react'
import { withStyles } from '@material-ui/styles'
import Button from 'core/elements/button'

const styles = (theme) => ({
  baseButton: {
    margin: theme.spacing(1),
  },
  noMarginButton: {
    borderRadius: 2,
  },
})

const SubmitButton = ({ children, classes, disabled, noMargin = false, ...rest }) => {
  const params = {
    className: noMargin ? classes.noMarginButton : classes.baseButton,
    color: 'primary',
    disabled,
    ...rest,
  }

  return (
    <Button type="submit" {...params}>
      {children || 'Submit'}
    </Button>
  )
}

export default withStyles(styles)(SubmitButton)
