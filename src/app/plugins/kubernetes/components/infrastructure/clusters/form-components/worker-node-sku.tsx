import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import AzureSkuPicklist from '../azure/AzureSkuPicklist'

const workerNodeSkuField = ({ cloudProviderId, cloudProviderRegionId, wizardContext }) => (
  <PicklistField
    DropdownComponent={AzureSkuPicklist}
    disabled={!(cloudProviderId && cloudProviderRegionId)}
    id="workerSku"
    label="Worker Node SKU"
    cloudProviderId={cloudProviderId}
    cloudProviderRegionId={cloudProviderRegionId}
    filterByZones={!wizardContext.useAllAvailabilityZones}
    selectedZones={wizardContext.zones}
    info="Choose an instance type used by worker nodes."
    required
  />
)

export default workerNodeSkuField
