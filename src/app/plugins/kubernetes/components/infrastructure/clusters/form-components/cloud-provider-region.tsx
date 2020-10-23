import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'

export const CloudProviderRegionField = ({
  cloudProviderType,
  wizardContext,
  onChange,
  id = 'region',
}) => (
  <PicklistField
    id={id}
    label="Region"
    DropdownComponent={CloudProviderRegionPicklist}
    type={cloudProviderType}
    cloudProviderId={wizardContext.cloudProviderId}
    onChange={onChange}
    disabled={!wizardContext.cloudProviderId}
    required
  />
)

export default CloudProviderRegionField
