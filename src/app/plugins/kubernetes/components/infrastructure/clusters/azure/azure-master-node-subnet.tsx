import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import AzureSubnetPicklist from './AzureSubnetPicklist'

const AzureMasterNodeSubnetField = ({ cloudProviderId, cloudProviderRegionId, resourceGroup }) => (
  <PicklistField
    DropdownComponent={AzureSubnetPicklist}
    disabled={!(cloudProviderId && cloudProviderRegionId)}
    id="masterSubnetName"
    label="Master node subnet"
    cloudProviderId={cloudProviderId}
    cloudProviderRegionId={cloudProviderRegionId}
    resourceGroup={resourceGroup}
    info="Select the subnet for your master nodes. Can be the same as worker node subnet."
    required
  />
)

export default AzureMasterNodeSubnetField
