import React from 'react'
import PropTypes from 'prop-types'
import CloseButton from 'core/components/buttons/CloseButton'
import { withStyles } from '@material-ui/styles'
import { Divider, Grid, Typography } from '@material-ui/core'
import { withProgress } from 'core/components/progress/Progress'

const styles = theme => ({
  root: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    padding: theme.spacing(5),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
  buttonBase: {
    textTransform: 'none',
  },
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

FormWrapper.propTypes = {
  backUrl: PropTypes.string,
  title: PropTypes.string,
}

export default withProgress(FormWrapper, {
  renderContentOnMount: true,
  message: 'Submitting form...',
})
