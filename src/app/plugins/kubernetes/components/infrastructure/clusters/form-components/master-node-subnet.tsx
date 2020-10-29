import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import { CloudProviders } from '../../cloudProviders/model'

const MasterNodeSubnetField = ({ dropdownComponent, cloudProviderType, wizardContext, values }) => {
  const cloudProviderRegionId =
    cloudProviderType === CloudProviders.Aws ? wizardContext.region : wizardContext.location // For Azure, it's location, not region

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
