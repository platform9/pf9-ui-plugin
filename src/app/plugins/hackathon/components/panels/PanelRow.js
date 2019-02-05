import React from 'react'
import PropTypes from 'prop-types'
import { Grid } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => {
  console.log(theme)
  return {
    right: {
      backgroundColor: '#eee',
      padding: theme.spacing.unit * 1,
      marginBottom: theme.spacing.unit,
    }
  }
}

const PanelRow = ({ classes, title, children }) => (
  <React.Fragment>
    <Grid item xs={4}>{title}</Grid>
    <Grid item xs={8} className={classes.right}>{children}</Grid>
  </React.Fragment>
)

PanelRow.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
}

export default withStyles(styles)(PanelRow)
