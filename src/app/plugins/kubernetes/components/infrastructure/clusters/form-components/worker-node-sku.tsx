import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const WorkerNodeSkuField = ({ dropdownComponent, values }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(values.cloudProviderId && values.region)}
    id="workerSku"
    label="Worker Node SKU"
    cloudProviderId={values.cloudProviderId}
    cloudProviderRegionId={values.region}
    filterByZones={!values.useAllAvailabilityZones}
    selectedZones={values.zones}
    info="Choose an instance type used by worker nodes."
    required
  />
)

export default WorkerNodeSkuField
