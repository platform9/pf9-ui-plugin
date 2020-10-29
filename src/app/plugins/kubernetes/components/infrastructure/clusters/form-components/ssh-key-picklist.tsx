import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import { CloudProviders } from '../../cloudProviders/model'

export default ({ dropdownComponent, cloudProviderType, values, wizardContext }) => {
  const cloudProviderRegionId =
    cloudProviderType === CloudProviders.Aws ? values.region : wizardContext.location // For Azure, it's location, not region
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
