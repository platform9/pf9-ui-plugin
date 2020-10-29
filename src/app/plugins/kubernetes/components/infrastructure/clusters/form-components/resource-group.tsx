import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import { CloudProviders } from '../../cloudProviders/model'

const ResourceGroupField = ({ dropdownComponent, cloudProviderType, wizardContext }) => {
  const cloudProviderRegionId =
    cloudProviderType === CloudProviders.Aws ? wizardContext.region : wizardContext.location // For Azure, it's location, not region
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(wizardContext.cloudProviderId && cloudProviderRegionId)}
      id="vnetResourceGroup"
      label="Resource group"
      cloudProviderId={wizardContext.cloudProviderId}
      cloudProviderRegionId={cloudProviderRegionId}
      info="Select the resource group that your networking resources belong to."
      required
    />
  )
}

export default ResourceGroupField
