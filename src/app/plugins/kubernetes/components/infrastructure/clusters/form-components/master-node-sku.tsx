import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import { CloudProviders } from '../../cloudProviders/model'

const MasterNodeSkuField = ({ dropdownComponent, cloudProviderType, wizardContext, values }) => {
  const cloudProviderRegionId =
    cloudProviderType === CloudProviders.Aws ? values.region : wizardContext.location // For Azure, it's location, not region
  return (
    <PicklistField
      DropdownComponent={dropdownComponent}
      disabled={!(values.cloudProviderId && cloudProviderRegionId)}
      id="masterSku"
      label="Master Node SKU"
      cloudProviderId={values.cloudProviderId}
      cloudProviderRegionId={cloudProviderRegionId}
      filterByZones={!values.useAllAvailabilityZones}
      selectedZones={wizardContext.zones}
      info="Choose an instance type used by master nodes."
      required
    />
  )
}

export default MasterNodeSkuField
