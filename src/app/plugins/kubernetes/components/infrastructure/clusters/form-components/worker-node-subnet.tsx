import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const WorkerNodeSubnetField = ({ dropdownComponent, wizardContext, values }) => {
  const cloudProviderRegionId =
    wizardContext.region !== 'undefined' ? wizardContext.region : wizardContext.location // AWS uses region. Azure uses location
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(wizardContext.cloudProviderId && cloudProviderRegionId)}
      id="workerSubnetName"
      label="Worker node subnet"
      cloudProviderId={wizardContext.cloudProviderId}
      cloudProviderRegionId={cloudProviderRegionId}
      resourceGroup={values.vnetResourceGroup}
      info="Select the subnet for your worker nodes. Can be the same as master node subnet."
      required
    />
  )
}

export default WorkerNodeSubnetField
