import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const WorkerNodeSkuField = ({ dropdownComponent, wizardContext }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(wizardContext.cloudProviderId && wizardContext.cloudProviderRegionId)}
    id="workerSku"
    label="Worker Node SKU"
    cloudProviderId={wizardContext.cloudProviderId}
    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
    filterByZones={!wizardContext.useAllAvailabilityZones}
    selectedZones={wizardContext.zones}
    info="Choose an instance type used by worker nodes."
    required
  />
)

export default WorkerNodeSkuField
