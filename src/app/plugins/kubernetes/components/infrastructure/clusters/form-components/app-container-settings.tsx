import React from 'react'
import Text from 'core/elements/text'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { makeStyles } from '@material-ui/core'
import Theme from 'core/themes/model'

const useStyles = makeStyles((theme: Theme) => ({
  appAndContainerSettingsCheckboxes: {
    marginTop: theme.spacing(1),
  },
}))

const AppAndContainerSettingsFields = () => {
  const classes = useStyles()
  return (
    <div className={classes.appAndContainerSettingsCheckboxes}>
      <Text variant="subtitle2">Application & Container Settings</Text>
      <CheckboxField
        id="makeMasterNodesMasterAndWorker"
        label="Make Master nodes Master + Worker"
      />
      <CheckboxField id="privilegedContainersEnabled" label="Enable Privileged Containers" />
    </div>
  )
}

export default AppAndContainerSettingsFields
