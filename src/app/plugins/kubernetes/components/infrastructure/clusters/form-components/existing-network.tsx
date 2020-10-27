import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const ExistingNetworkField = ({ dropdownComponent, wizardContext }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(wizardContext.cloudProviderId && wizardContext.cloudProviderRegionId)}
    id="vnetName"
    label="Select existing network"
    cloudProviderId={wizardContext.cloudProviderId}
    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
    resourceGroup={wizardContext.vnetResourceGroup}
    info="Select the network for your cluster."
    required
  />
)

export default ExistingNetworkField
