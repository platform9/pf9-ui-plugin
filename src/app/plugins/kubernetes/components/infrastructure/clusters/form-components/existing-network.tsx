import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const ExistingNetworkField = ({ dropdownComponent, values }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(values.cloudProviderId && values.region)}
    id="vnetName"
    label="Select existing network"
    cloudProviderId={values.cloudProviderId}
    cloudProviderRegionId={values.region}
    resourceGroup={values.vnetResourceGroup}
    info="Select the network for your cluster."
    required
  />
)

export default ExistingNetworkField
