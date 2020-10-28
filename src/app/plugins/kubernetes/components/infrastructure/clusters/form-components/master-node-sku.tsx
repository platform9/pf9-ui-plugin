import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const MasterNodeSkuField = ({ dropdownComponent, values }) => {
  const cloudProviderRegionId = values.region !== 'undefined' ? values.region : values.location // AWS uses region. Azure uses location
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(values.cloudProviderId && cloudProviderRegionId)}
      id="masterSku"
      label="Master Node SKU"
      cloudProviderId={values.cloudProviderId}
      cloudProviderRegionId={cloudProviderRegionId}
      filterByZones={!values.useAllAvailabilityZones}
      selectedZones={values.zones}
      info="Choose an instance type used by master nodes."
      required
    />
  )
}

export default MasterNodeSkuField
