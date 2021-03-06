import React from 'react'
import AwsAvailabilityZoneChooser from '../../cloudProviders/AwsAvailabilityZoneChooser'
import { CloudProviders } from '../../cloudProviders/model'

const AwsAvailabilityZoneField = ({
  values,
  wizardContext,
  setWizardContext,
  allowMultiSelect,
}) => (
  <AwsAvailabilityZoneChooser
    id="azs"
    info="Select from the Availability Zones for the specified region"
    cloudProviderId={values.cloudProviderId}
    cloudProviderRegionId={values.region}
    onChange={(value) => setWizardContext({ azs: Array.isArray(value) ? value : [value] })}
    values={wizardContext.azs}
    type={CloudProviders.Aws}
    required
    allowMultiSelect={allowMultiSelect}
  />
)

export default AwsAvailabilityZoneField
