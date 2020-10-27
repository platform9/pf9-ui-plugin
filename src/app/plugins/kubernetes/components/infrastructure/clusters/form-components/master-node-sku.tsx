import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const MasterNodeSkuField = ({ dropdownComponent, wizardContext }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(wizardContext.cloudProviderId && wizardContext.cloudProviderRegionId)}
    id="masterSku"
    label="Master Node SKU"
    cloudProviderId={wizardContext.cloudProviderId}
    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
    filterByZones={!wizardContext.useAllAvailabilityZones}
    selectedZones={wizardContext.zones}
    info="Choose an instance type used by master nodes."
    required
  />
)

export default MasterNodeSkuField
