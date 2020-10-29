import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const MasterNodeSkuField = ({ dropdownComponent, values }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(values.cloudProviderId && values.region)}
    id="masterSku"
    label="Master Node SKU"
    cloudProviderId={values.cloudProviderId}
    cloudProviderRegionId={values.region}
    filterByZones={!values.useAllAvailabilityZones}
    selectedZones={values.zones}
    info="Choose an instance type used by master nodes."
    required
  />
)

export default MasterNodeSkuField
