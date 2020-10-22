import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import AzureSkuPicklist from '../azure/AzureSkuPicklist'

const MasterNodeSkuField = ({ cloudProviderId, cloudProviderRegionId, wizardContext }) => (
  <PicklistField
    DropdownComponent={AzureSkuPicklist}
    disabled={!(cloudProviderId && cloudProviderRegionId)}
    id="masterSku"
    label="Master Node SKU"
    cloudProviderId={cloudProviderId}
    cloudProviderRegionId={cloudProviderRegionId}
    filterByZones={!wizardContext.useAllAvailabilityZones}
    selectedZones={wizardContext.zones}
    info="Choose an instance type used by master nodes."
    required
  />
)

export default MasterNodeSkuField
