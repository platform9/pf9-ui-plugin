import React from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  baseButton: {
    margin: theme.spacing(1),
    borderRadius: 2,
  },
})

const NewEntryButton = ({ children, classes, disabled, ...rest }) => {
  const params = {
    className: classes.baseButton,
    color: disabled ? 'primary' : 'primary',
    variant: 'text',
    disabled,
    ...rest,
  }

  return (
    <Button {...params}>
      + {children}
    </Button>
  )
}

export default withStyles(styles)(NewEntryButton)
