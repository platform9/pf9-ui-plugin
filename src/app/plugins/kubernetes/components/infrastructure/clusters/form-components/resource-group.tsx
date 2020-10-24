import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const ResourceGroupField = ({ dropdownComponent, wizardContext, setWizardContext }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(wizardContext.cloudProviderId && wizardContext.cloudProviderRegionId)}
    id="vnetResourceGroup"
    label="Resource group"
    cloudProviderId={wizardContext.cloudProviderId}
    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
    onChange={(value) => setWizardContext({ vnetResourceGroup: value })}
    info="Select the resource group that your networking resources belong to."
    required
  />
)

export default ResourceGroupField
