import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'

export default ({ dropdownComponent, values }) => {
  const cloudProviderRegionId = values.region !== undefined ? values.region : values.location // AWS uses region. Azure uses location.
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(values.cloudProviderId && cloudProviderRegionId)}
      id="sshKey"
      label="SSH Key"
      cloudProviderId={values.cloudProviderId}
      cloudProviderRegionId={cloudProviderRegionId}
      info="Select an AWS SSH key to be associated with the nodes. This key can be used to access the nodes for debugging or other purposes."
      required
    />
  )
}
