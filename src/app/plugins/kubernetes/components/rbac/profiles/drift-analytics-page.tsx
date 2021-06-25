import React from 'react'
import IdeasComingSoon from 'core/components/IdeasComingSoon'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  ideasContainer: {
    marginTop: 200,
    display: 'flex',
    justifyContent: 'center',
  },
}))

const DriftAnalyticsPage = () => {
  const classes = useStyles({})
  return (
    <div className={classes.ideasContainer}>
      <IdeasComingSoon
        title="Enforce Compliance with Analytics"
        copy="Coming soon, RBAC Policy Drift Analytics. Instantly compare a cluster's RBAC configuration to your RBAC Profiles to identify drift and resolve compliance issues."
      />
    </div>
  )
}

export default DriftAnalyticsPage
