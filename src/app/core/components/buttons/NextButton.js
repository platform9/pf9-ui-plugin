import React from 'react'
import Button from '@material-ui/core/Button'
import Icon from '@material-ui/core/Icon'
import { withStyles } from '@material-ui/styles'
import { TestId } from 'utils/testId'

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
    color: disabled ? 'primary' : 'primary',
    variant: 'contained',
    disabled,
    ...rest,
  }

  return (
    <Button data-testid={TestId.TEST_NEXT_BUTTON} {...params}>
      {children || 'Next'}
      {showForward && (
        <Icon data-testid={TestId.TEST_NEXT_BUTTON_ICON} className={classes.rightIcon}>
          arrow_forward
        </Icon>
      )}
    </Button>
  )
}

export default withStyles(styles)(NextButton)
