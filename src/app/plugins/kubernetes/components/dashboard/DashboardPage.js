import React from 'react'
import { compose } from 'app/utils/fp'
import { makeStyles, createStyles } from '@material-ui/styles'
import { Typography } from '@material-ui/core'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import ClusterSetupWizard from './ClusterSetupWizard'

const useStyles = makeStyles(theme => createStyles({
  welcome: {
    fontSize: '24px',
    marginBottom: '20px'
  }
}))

const Dashboard = () => {
  const classes = useStyles()

  return (
    <div>
      <Typography className={classes.welcome}>Welcome (username)</Typography>
      <ClusterSetupWizard />
    </div>
  )
}

export default compose(
  requiresAuthentication
)(Dashboard)
