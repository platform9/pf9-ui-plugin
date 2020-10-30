import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const ResourceGroupField = ({ dropdownComponent, wizardContext }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(wizardContext.cloudProviderId && wizardContext.region)}
    id="vnetResourceGroup"
    label="Resource group"
    cloudProviderId={wizardContext.cloudProviderId}
    cloudProviderRegionId={wizardContext.region}
    info="Select the resource group that your networking resources belong to."
    required
  />
)

export default ResourceGroupField
