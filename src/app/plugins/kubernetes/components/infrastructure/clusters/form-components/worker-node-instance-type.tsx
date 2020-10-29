import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const WorkerNodeInstanceTypeField = ({ dropdownComponent, values }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(values.cloudProviderId && values.region)}
    id="workerFlavor"
    label="Worker Node Instance Type"
    cloudProviderId={values.cloudProviderId}
    cloudProviderRegionId={values.region}
    info="Choose an instance type used by worker nodes."
    required
  />
)

export default WorkerNodeInstanceTypeField
