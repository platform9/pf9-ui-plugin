import React from 'react'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  root: {
    marginTop: '20px',
  }
})

const FormButtons = ({ classes, children }) => (
  <div className={classes.root}>
    {children}
  </div>
)

export default withStyles(styles)(FormButtons)
