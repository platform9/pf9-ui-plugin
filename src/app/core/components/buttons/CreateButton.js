import React from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  baseButton: {
    margin: theme.spacing(1),
    borderRadius: 2,
    textTransform: 'none',
    height: 40,
    boxShadow: '0 3px 1px -2px rgba(0, 0, 0, 0.11), 0 2px 2px 0 rgba(0, 0, 0, 0.11), 0 1px 5px 0 rgba(0, 0, 0, 0.2)',
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
