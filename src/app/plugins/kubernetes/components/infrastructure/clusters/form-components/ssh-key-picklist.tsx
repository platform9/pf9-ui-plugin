import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'

export default ({ dropdownComponent, wizardContext }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(wizardContext.cloudProviderId && wizardContext.cloudProviderRegionId)}
    id="sshKey"
    label="SSH Key"
    cloudProviderId={wizardContext.cloudProviderId}
    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
    info="Select an AWS SSH key to be associated with the nodes. This key can be used to access the nodes for debugging or other purposes."
    required
  />
)
