import React from 'react'
import PropTypes from 'prop-types'
import CloseButton from 'core/components/buttons/CloseButton'
import { makeStyles } from '@material-ui/styles'
import { Grid } from '@material-ui/core'
import Progress from 'core/components/progress/Progress'
import { pick, keys } from 'ramda'
import Text from 'core/elements/text'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    padding: theme.spacing(5),
  },
  title: {
    marginBottom: ({ isUpdateForm }) => (isUpdateForm ? theme.spacing(1) : theme.spacing(2)),
  },
  buttonBase: {
    textTransform: 'none',
  },
  gridHeader: {
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
}))

const FormWrapper = ({
  backUrl = undefined,
  children,
  title,
  className = undefined,
  isUpdateForm = false,
  ...rest
}) => {
  const classes = useStyles({ isUpdateForm })
  const progressProps = pick(keys(Progress.propTypes), rest)
  return (
    <Grid container>
      <Grid item xs={11}>
        <Grid container justify="space-between" className={isUpdateForm ? classes.gridHeader : ''}>
          <Grid item>
            <Text variant="subtitle1" className={classes.title}>
              {title}
            </Text>
          </Grid>
          {backUrl && (
            <Grid item>
              <CloseButton to={backUrl} />
            </Grid>
          )}
        </Grid>
        <Progress {...progressProps}>
          <div className={className}>{children}</div>
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
