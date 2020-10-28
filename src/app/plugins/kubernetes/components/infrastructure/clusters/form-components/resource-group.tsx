import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const ResourceGroupField = ({ dropdownComponent, wizardContext }) => {
  const cloudProviderRegionId =
    wizardContext.region !== 'undefined' ? wizardContext.region : wizardContext.location // AWS uses region. Azure uses location
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
