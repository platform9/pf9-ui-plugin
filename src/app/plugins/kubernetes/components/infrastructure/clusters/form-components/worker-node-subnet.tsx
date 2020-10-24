import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const WorkerNodeSubnetField = ({ dropdownComponent, wizardContext }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(wizardContext.cloudProviderId && wizardContext.cloudProviderRegionId)}
    id="workerSubnetName"
    label="Worker node subnet"
    cloudProviderId={wizardContext.cloudProviderId}
    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
    resourceGroup={wizardContext.vnetResourceGroup}
    info="Select the subnet for your worker nodes. Can be the same as master node subnet."
    required
  />
)

export default WorkerNodeSubnetField
