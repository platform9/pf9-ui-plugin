import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import AzureResourceGroupPicklist from './AzureResourceGroupPicklist'

const AzureResourceGroupField = ({ cloudProviderId, cloudProviderRegionId, getParamsUpdater }) => (
  <PicklistField
    DropdownComponent={AzureResourceGroupPicklist}
    disabled={!(cloudProviderId && cloudProviderRegionId)}
    id="vnetResourceGroup"
    label="Resource group"
    cloudProviderId={cloudProviderId}
    cloudProviderRegionId={cloudProviderRegionId}
    onChange={getParamsUpdater('resourceGroup')}
    info="Select the resource group that your networking resources belong to."
    required
  />
)

export default AzureResourceGroupField
