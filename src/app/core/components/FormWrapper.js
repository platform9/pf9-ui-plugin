import React from 'react'
import PropTypes from 'prop-types'
import CloseButton from 'core/components/buttons/CloseButton'
import { makeStyles } from '@material-ui/styles'
import { Divider, Grid, Typography } from '@material-ui/core'
import Progress from 'core/components/progress/Progress'
import { pick, keys } from 'ramda'

const useStyles = makeStyles(theme => ({
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
}))

const FormWrapper = ({
  backUrl = undefined,
  children,
  title,
  className,
  ...rest
}) => {
  const classes = useStyles()
  const progressProps = pick(keys(Progress.propTypes), rest)
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
        <Progress {...progressProps}>
          <div className={className}>
            {children}
          </div>
        </Progress>
      </Grid>
    </Grid>
  )
}

FormWrapper.propTypes = {
  backUrl: PropTypes.string,
  title: PropTypes.string,
  ...Progress.propTypes,
}

FormWrapper.defaultProps = {
  renderContentOnMount: true,
  message: 'Submitting form...',
}

export default FormWrapper
