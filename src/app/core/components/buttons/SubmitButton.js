import React from 'react'
import { withStyles } from '@material-ui/styles'
import Button from 'core/elements/button'

const styles = (theme) => ({
  baseButton: {
    margin: theme.spacing(1),
  },
})

const SubmitButton = ({ children, classes, disabled, ...rest }) => {
  const params = {
    className: classes.baseButton,
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
