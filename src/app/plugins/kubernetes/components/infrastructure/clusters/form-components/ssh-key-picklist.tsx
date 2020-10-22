import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'

export default ({ sshKeyPicklist, cloudProviderId, cloudProviderRegionId, required = true }) => (
  <PicklistField
    DropdownComponent={sshKeyPicklist}
    disabled={!(cloudProviderId && cloudProviderRegionId)}
    id="sshKey"
    label="SSH Key"
    cloudProviderId={cloudProviderId}
    cloudProviderRegionId={cloudProviderRegionId}
    info="Select an AWS SSH key to be associated with the nodes. This key can be used to access the nodes for debugging or other purposes."
    required={required}
  />
)
