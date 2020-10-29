import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import { CloudProviders } from '../../cloudProviders/model'

const ExistingNetworkField = ({ dropdownComponent, cloudProviderType, values, wizardContext }) => {
  const cloudProviderRegionId =
    cloudProviderType === CloudProviders.Aws ? wizardContext.region : wizardContext.location // For Azure, it's location, not region

  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(wizardContext.cloudProviderId && cloudProviderRegionId)}
      id="vnetName"
      label="Select existing network"
      cloudProviderId={wizardContext.cloudProviderId}
      cloudProviderRegionId={cloudProviderRegionId}
      resourceGroup={values.vnetResourceGroup}
      info="Select the network for your cluster."
      required
    />
  )
}

export default ExistingNetworkField
