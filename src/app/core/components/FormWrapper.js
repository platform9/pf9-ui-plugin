import React from 'react'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/styles'
import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core'

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 5,
    marginBottom: theme.spacing.unit * 5,
    padding: theme.spacing.unit * 5,
  },
  title: {
    color: theme.palette.grey[700],
    marginBottom: theme.spacing.unit * 2
  },
  divider: {
    marginBottom: theme.spacing.unit * 2
  }
})

@withStyles(styles)
class FormWrapper extends React.Component {
  render () {
    const {
      backUrl,
      children,
      classes,
      title,
    } = this.props
    return (
      <Grid container justify="center">
        <Grid item xs={11}>
          <Paper className={classes.root}>
            <Grid container justify="space-between">
              <Grid item>
                <Typography
                  variant="h3"
                  className={classes.title}
                >
                  {title}
                </Typography>
              </Grid>
              {backUrl &&
                <Grid item>
                  <Button
                    variant="outlined"
                    component={Link}
                    to={backUrl}
                  >
                    &larr;&nbsp;Back to list
                  </Button>
                </Grid>
              }
            </Grid>
            <Divider className={classes.divider} />
            {children}
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

export default FormWrapper
