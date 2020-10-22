import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import AzureVnetPicklist from './AzureVnetPicklist'

const AzureExistingNetworkField = ({ cloudProviderId, cloudProviderRegionId, resourceGroup }) => (
  <PicklistField
    DropdownComponent={AzureVnetPicklist}
    disabled={!(cloudProviderId && cloudProviderRegionId)}
    id="vnetName"
    label="Select existing network"
    cloudProviderId={cloudProviderId}
    cloudProviderRegionId={cloudProviderRegionId}
    resourceGroup={resourceGroup}
    info="Select the network for your cluster."
    required
  />
)

export default AzureExistingNetworkField
