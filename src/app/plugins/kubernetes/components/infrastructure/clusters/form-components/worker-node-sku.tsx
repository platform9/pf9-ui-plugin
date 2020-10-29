import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const WorkerNodeSkuField = ({ dropdownComponent, values }) => {
  const cloudProviderRegionId = values.region !== 'undefined' ? values.region : values.location // AWS uses region. Azure uses location
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(values.cloudProviderId && cloudProviderRegionId)}
      id="workerSku"
      label="Worker Node SKU"
      cloudProviderId={values.cloudProviderId}
      cloudProviderRegionId={cloudProviderRegionId}
      filterByZones={!values.useAllAvailabilityZones}
      selectedZones={values.zones}
      info="Choose an instance type used by worker nodes."
      required
    />
  )
}

export default WorkerNodeSkuField
