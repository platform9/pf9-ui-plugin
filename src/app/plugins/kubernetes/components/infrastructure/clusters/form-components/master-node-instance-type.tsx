import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const MasterNodeInstanceTypeField = ({ dropdownComponent, values }) => {
  const cloudProviderRegionId = values.region !== 'undefined' ? values.region : values.location // AWS uses region. Azure uses location
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(values.cloudProviderId && cloudProviderRegionId)}
      id="masterFlavor"
      label="Master Node Instance Type"
      cloudProviderId={values.cloudProviderId}
      cloudProviderRegionId={cloudProviderRegionId}
      info="Choose an instance type used by master nodes."
      required
    />
  )
}

export default MasterNodeInstanceTypeField
