import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'

const additionalInfo =
  'Select an AWS SSH key to be associated with the nodes. This key can be used to access the nodes for debugging or other purposes.'

export default ({
  dropdownComponent,
  values,
  value,
  onChange = undefined,
  info = additionalInfo,
  required = true,
}) => {
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(values.cloudProviderId && values.region)}
      id="sshKey"
      label="SSH Key"
      cloudProviderId={values.cloudProviderId}
      cloudProviderRegionId={values.region}
      info={info}
      value={value}
      onChange={onChange}
      required={required}
    />
  )
}
