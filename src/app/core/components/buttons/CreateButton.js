import React from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/styles'
import Text from 'core/elements/text'

const styles = (theme) => ({
  baseButton: {
    margin: 0,
    borderRadius: 2,
    textTransform: 'none',
    height: 40,
    minWidth: 150,
  },
  text: {
    color: theme.palette.grey['000'],
  },
})

const CreateButton = ({ children, classes, ...rest }) => (
  <Button className={classes.baseButton} variant="contained" size="large" color="primary" {...rest}>
    <Text variant="buttonSecondary" className={classes.text}>
      + {children}
    </Text>
  </Button>
)

export default withStyles(styles)(CreateButton)
