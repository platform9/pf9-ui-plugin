import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'

const CloudProviderRegionField = ({ cloudProviderType, onChange, values, required = true }) => (
  <PicklistField
    id="region"
    label="Region"
    DropdownComponent={CloudProviderRegionPicklist}
    type={cloudProviderType}
    cloudProviderId={values.cloudProviderId}
    onChange={onChange}
    disabled={!values.cloudProviderId}
    required={required}
  />
)

export default CloudProviderRegionField
