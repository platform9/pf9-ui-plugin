import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'

export const CloudProviderRegionField = ({
  providerType,
  cloudProviderId,
  onChange,
  id = 'region',
  required = true,
}) => (
  <PicklistField
    id={id}
    label="Region"
    DropdownComponent={CloudProviderRegionPicklist}
    type={providerType}
    cloudProviderId={cloudProviderId}
    onChange={onChange}
    disabled={!cloudProviderId}
    required={required}
  />
)

export default CloudProviderRegionField
