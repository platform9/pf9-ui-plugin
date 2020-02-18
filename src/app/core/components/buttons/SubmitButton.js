import React from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/styles'
import { TestId } from 'utils/testId'

const styles = (theme) => ({
  baseButton: {
    margin: theme.spacing(1),
    borderRadius: 2,
  },
})

const SubmitButton = ({ children, classes, disabled, ...rest }) => {
  const params = {
    className: classes.baseButton,
    color: disabled ? 'secondary' : 'primary',
    variant: 'contained',
    disabled,
    ...rest,
  }

  return (
    <Button type="submit" {...params} data-testid={TestId.TEST_SUBMIT_BUTTON}>
      {children || 'Submit'}
    </Button>
  )
}

export default withStyles(styles)(SubmitButton)
