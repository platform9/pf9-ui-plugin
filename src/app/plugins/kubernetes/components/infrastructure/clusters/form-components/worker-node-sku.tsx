import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import { CloudProviders } from '../../cloudProviders/model'

const WorkerNodeSkuField = ({ dropdownComponent, cloudProviderType, wizardContext, values }) => {
  const cloudProviderRegionId =
    cloudProviderType === CloudProviders.Aws ? wizardContext.region : wizardContext.location // For Azure, it's location, not region
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(values.cloudProviderId && cloudProviderRegionId)}
      id="workerSku"
      label="Worker Node SKU"
      cloudProviderId={values.cloudProviderId}
      cloudProviderRegionId={cloudProviderRegionId}
      filterByZones={!values.useAllAvailabilityZones}
      selectedZones={wizardContext.zones}
      info="Choose an instance type used by worker nodes."
      required
    />
  )
}

export default WorkerNodeSkuField
