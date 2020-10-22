import { makeStyles } from '@material-ui/styles'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import Theme from 'core/themes/model'
import React from 'react'
import AzureAvailabilityZoneChooser from './AzureAvailabilityZoneChooser'

const useStyles = makeStyles((theme: Theme) => ({
  availability: {
    maxWidth: '50%',
    margin: theme.spacing(1.5, 0),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}))

const AzureAvailabilityZoneFields = ({
  cloudProviderRegionId,
  values,
  wizardContext,
  setWizardContext,
}) => {
  const classes = useStyles()
  return (
    <>
      <CheckboxField
        id="useAllAvailabilityZones"
        label="Use all availability zones"
        onChange={(value) => setWizardContext({ useAllAvailabilityZones: value, zones: [] })}
        value={!cloudProviderRegionId ? false : wizardContext.useAllAvailabilityZones}
        info=""
        disabled={!cloudProviderRegionId}
      />

      {/* Azure Availability Zone */}
      {!cloudProviderRegionId || values.useAllAvailabilityZones || (
        <div className={classes.availability}>
          <AzureAvailabilityZoneChooser
            id="zones"
            info="Select from the Availability Zones for the specified region"
            onChange={(value) => setWizardContext({ zones: value })}
            required
          />
        </div>
      )}
    </>
  )
}

export default AzureAvailabilityZoneFields
