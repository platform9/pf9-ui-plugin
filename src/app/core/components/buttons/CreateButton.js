import React from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  baseButton: {
    margin: theme.spacing.unit * 1,
    borderRadius: 2,
  }
})

const CreateButton = ({ children, classes, ...rest }) => (
  <Button
    className={classes.baseButton}
    variant="contained"
    size="large"
    color="primary"
    {...rest}
  >
    + {children}
  </Button>
)

export default withStyles(styles)(CreateButton)
