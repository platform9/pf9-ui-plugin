import React from 'react'
import { withStyles } from '@material-ui/styles'
import Button from 'core/elements/button'

const styles = (theme) => ({
  baseButton: {
    margin: 0,
    borderRadius: 2,
    height: 40,
    minWidth: 150,
  },
})

const CreateButton = ({ children, classes, ...rest }) => (
  <Button className={classes.baseButton} variant="light" color="primary" {...rest}>
    + {children}
  </Button>
)

export default withStyles(styles)(CreateButton)
