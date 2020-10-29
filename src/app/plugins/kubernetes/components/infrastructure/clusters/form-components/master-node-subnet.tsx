import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const MasterNodeSubnetField = ({ dropdownComponent, wizardContext, values }) => {
  const cloudProviderRegionId =
    wizardContext.region !== 'undefined' ? wizardContext.region : wizardContext.location // AWS uses region. Azure uses location

  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(wizardContext.cloudProviderId && cloudProviderRegionId)}
      id="masterSubnetName"
      label="Master node subnet"
      cloudProviderId={wizardContext.cloudProviderId}
      cloudProviderRegionId={cloudProviderRegionId}
      resourceGroup={values.vnetResourceGroup}
      info="Select the subnet for your master nodes. Can be the same as worker node subnet."
      required
    />
  )
}

export default MasterNodeSubnetField
