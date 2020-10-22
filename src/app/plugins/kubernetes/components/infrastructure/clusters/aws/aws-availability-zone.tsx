import React from 'react'
import AwsAvailabilityZoneChooser from '../../cloudProviders/AwsAvailabilityZoneChooser'
import { CloudProviders } from '../../cloudProviders/model'

const AwsAvailabilityZoneField = ({
  cloudProviderId,
  cloudProviderRegionId,
  wizardContext,
  setWizardContext,
}) => (
  <AwsAvailabilityZoneChooser
    id="azs"
    info="Select from the Availability Zones for the specified region"
    cloudProviderId={cloudProviderId}
    cloudProviderRegionId={cloudProviderRegionId}
    onChange={(value) => setWizardContext({ azs: value })}
    values={wizardContext.azs}
    type={CloudProviders.Aws}
    required
  />
)

export default AwsAvailabilityZoneField
