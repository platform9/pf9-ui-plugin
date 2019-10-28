import React from 'react'
import CloseButton from 'core/components/buttons/CloseButton'
import { withStyles } from '@material-ui/styles'
import { Divider, Grid, Typography } from '@material-ui/core'

const styles = theme => ({
  root: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    padding: theme.spacing(5),
  },
  title: {
    marginBottom: theme.spacing(2)
  },
  divider: {
    marginBottom: theme.spacing(2)
  },
  buttonBase: {
    textTransform: 'none',
  }
})

@withStyles(styles)
class FormWrapper extends React.PureComponent {
  render () {
    const {
      backUrl,
      children,
      classes,
      title,
      className,
    } = this.props
    return (
      <Grid container>
        <Grid item xs={11}>
          <Grid container justify="space-between">
            <Grid item>
              <Typography
                variant="h5"
                className={classes.title}
              >
                {title}
              </Typography>
            </Grid>
            {backUrl &&
              <Grid item>
                <CloseButton to={backUrl} />
              </Grid>
            }
          </Grid>
          <Divider className={classes.divider} />
          <div className={className}>
            {children}
          </div>
        </Grid>
      </Grid>
    )
  }
}

export default FormWrapper
