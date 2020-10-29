import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import { CloudProviders } from '../../cloudProviders/model'

const WorkerNodeInstanceTypeField = ({
  dropdownComponent,
  cloudProviderType,
  values,
  wizardContext,
}) => {
  const cloudProviderRegionId =
    cloudProviderType === CloudProviders.Aws ? values.region : wizardContext.location // For Azure, it's location, not region
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(values.cloudProviderId && cloudProviderRegionId)}
      id="workerFlavor"
      label="Worker Node Instance Type"
      cloudProviderId={values.cloudProviderId}
      cloudProviderRegionId={cloudProviderRegionId}
      info="Choose an instance type used by worker nodes."
      required
    />
  )
}

export default WorkerNodeInstanceTypeField
