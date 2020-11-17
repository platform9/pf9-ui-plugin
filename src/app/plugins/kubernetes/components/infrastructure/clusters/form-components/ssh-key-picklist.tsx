import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'

const additionalInfo =
  'Select an AWS SSH key to be associated with the nodes. This key can be used to access the nodes for debugging or other purposes.'

export default ({ dropdownComponent, values, info = additionalInfo }) => {
  console.log(
    'disabled',
    !(values.cloudProviderId && (values.region || values.cloudProviderRegionId)),
  )
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(values.cloudProviderId && (values.region || values.cloudProviderRegionId))}
      id="sshKey"
      label="SSH Key"
      cloudProviderId={values.cloudProviderId}
      cloudProviderRegionId={values.region ? values.region : values.cloudProviderRegionId}
      info={info}
      required
    />
  )
}
