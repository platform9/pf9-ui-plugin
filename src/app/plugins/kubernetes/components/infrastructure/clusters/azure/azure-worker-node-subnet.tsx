import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import AzureSubnetPicklist from './AzureSubnetPicklist'

const AzureWorkerNodeSubnetField = ({ cloudProviderId, cloudProviderRegionId, resourceGroup }) => (
  <PicklistField
    DropdownComponent={AzureSubnetPicklist}
    disabled={!(cloudProviderId && cloudProviderRegionId)}
    id="workerSubnetName"
    label="Worker node subnet"
    cloudProviderId={cloudProviderId}
    cloudProviderRegionId={cloudProviderRegionId}
    resourceGroup={resourceGroup}
    info="Select the subnet for your worker nodes. Can be the same as master node subnet."
    required
  />
)

export default AzureWorkerNodeSubnetField
