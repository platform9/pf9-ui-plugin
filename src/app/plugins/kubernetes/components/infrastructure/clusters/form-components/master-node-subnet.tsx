import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const MasterNodeSubnetField = ({ dropdownComponent, wizardContext }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(wizardContext.cloudProviderId && wizardContext.cloudProviderRegionId)}
    id="masterSubnetName"
    label="Master node subnet"
    cloudProviderId={wizardContext.cloudProviderId}
    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
    resourceGroup={wizardContext.vnetResourceGroup}
    info="Select the subnet for your master nodes. Can be the same as worker node subnet."
    required
  />
)

export default MasterNodeSubnetField
