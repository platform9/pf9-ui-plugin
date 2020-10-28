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

const AzureAvailabilityZoneFields = ({ values, setWizardContext }) => {
  const classes = useStyles()
  return (
    <>
      {/* Use All Availability Zone Checkbox */}
      <CheckboxField
        id="useAllAvailabilityZones"
        label="Use all availability zones"
        value={!values.region ? false : values.useAllAvailabilityZones}
        info=""
        disabled={!values.cloudProviderRegionId}
      />

      {/* Azure Availability Zone */}
      {!values.region || values.useAllAvailabilityZones || (
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
