import React from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/styles'
import { TestId } from 'utils/testId'

const styles = (theme) => ({
  baseButton: {
    margin: theme.spacing(1),
    borderRadius: 2,
    textTransform: 'none',
  },
})

const CancelButton = ({ children, classes, disabled, ...rest }) => {
  const params = {
    className: classes.baseButton,
    color: disabled ? 'secondary' : 'primary',
    variant: 'outlined',
    disabled,
    ...rest,
  }

  return (
    <Button {...params} data-testid={TestId.TEST_CANCEL_BUTTON}>
      {children || 'Cancel'}
    </Button>
  )
}

export default withStyles(styles)(CancelButton)
