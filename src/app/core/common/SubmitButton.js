import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
  }
})

const SubmitButton = ({ classes, children }) => (
  <Button
    className={classes.root}
    type="submit"
    variant="raised"
  >
    {children}
  </Button>
)

SubmitButton.propTypes = {
  children: PropTypes.node.isRequired,
}

export default withStyles(styles)(SubmitButton)
