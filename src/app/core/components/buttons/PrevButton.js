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
  leftIcon: {
    marginRight: theme.spacing(1),
  },
})

const PrevButton = ({ children, classes, disabled, ...rest }) => {
  const params = {
    className: classes.baseButton,
    color: disabled ? 'secondary' : 'primary',
    variant: 'outlined',
    disabled,
    ...rest,
  }

  return (
    <Button {...params} data-testid={TestId.TEST_PREVIOUS_BUTTON}>
      <Icon className={classes.leftIcon} data-testid={TestId.TEST_PREVIOUS_BUTTON_ICON}>
        arrow_back
      </Icon>
      {children || 'Back'}
    </Button>
  )
}

export default withStyles(styles)(PrevButton)
