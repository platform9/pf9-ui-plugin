import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const WorkerNodeInstanceTypeField = ({ dropdownComponent, wizardContext }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(wizardContext.cloudProviderId && wizardContext.cloudProviderRegionId)}
    id="workerFlavor"
    label="Worker Node Instance Type"
    cloudProviderId={wizardContext.cloudProviderId}
    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
    info="Choose an instance type used by worker nodes."
    required
  />
)

export default WorkerNodeInstanceTypeField
