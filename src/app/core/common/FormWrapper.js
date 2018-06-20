import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Divider, Grid, Paper, Typography } from '@material-ui/core'

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
    padding: theme.spacing.unit * 5
  },
  title: {
    color: theme.palette.grey[700],
    marginBottom: theme.spacing.unit * 2
  }
})

@withStyles(styles)
class FormWrapper extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      title: this.props.title
    }
  }

  render () {
    const { title } = this.state
    const { children, classes } = this.props
    return (
      <Grid container justify="center">
        <Grid item xs={11}>
          <Paper className={classes.root}>
            <Typography
              variant="display2"
              className={classes.title}
            >
              {title}
            </Typography>
            <Divider />
            {children}
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

export default FormWrapper
