import React from 'react'
import Text from 'core/elements/text'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => ({
  managedAddOnsCheckboxes: {
    marginTop: theme.spacing(1),
  },
}))

const ManagedAddOnsField = () => {
  const classes = useStyles()
  return (
    <div className={classes.managedAddOnsCheckboxes}>
      <Text variant="subtitle2">Managed Add-Ons</Text>
      <CheckboxField id="etcdBackupEnabled" label="Enable ETCD backup" />
      <CheckboxField id="prometheusMonitoringEnabled" label="Enable monitoring with Prometheus" />
    </div>
  )
}

export default ManagedAddOnsField
