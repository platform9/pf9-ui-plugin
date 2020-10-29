import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const ExistingNetworkField = ({ dropdownComponent, values, wizardContext }) => {
  const cloudProviderRegionId =
    wizardContext.region !== 'undefined' ? wizardContext.region : wizardContext.location // AWS uses region. Azure uses location

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
