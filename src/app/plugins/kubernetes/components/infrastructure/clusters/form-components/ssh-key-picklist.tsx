import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'

export default ({ dropdownComponent, values }) => {
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(values.cloudProviderId && values.region)}
      id="sshKey"
      label="SSH Key"
      cloudProviderId={values.cloudProviderId}
      cloudProviderRegionId={values.region}
      info="Select an AWS SSH key to be associated with the nodes. This key can be used to access the nodes for debugging or other purposes."
      required
    />
  )
}
