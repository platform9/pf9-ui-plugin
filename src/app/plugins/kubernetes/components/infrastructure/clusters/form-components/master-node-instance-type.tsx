import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import { CloudProviders } from '../../cloudProviders/model'

const MasterNodeInstanceTypeField = ({ dropdownComponent, cloudProviderType, values }) => {
  const cloudProviderRegionId =
    cloudProviderType === CloudProviders.Aws ? values.region : values.location // For Azure, it's location, not region
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
