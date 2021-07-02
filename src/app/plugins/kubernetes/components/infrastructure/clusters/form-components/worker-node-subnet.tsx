import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const WorkerNodeSubnetField = ({ dropdownComponent, values }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(values.cloudProviderId && values.region)}
    id="workerSubnetName"
    label="Worker node subnet"
    cloudProviderId={values.cloudProviderId}
    cloudProviderRegionId={values.region}
    resourceGroup={values.vnetResourceGroup}
    vnetName={values.vnetName}
    info="Select the subnet for your worker nodes. Can be the same as master node subnet."
    required
  />
)

export default WorkerNodeSubnetField
