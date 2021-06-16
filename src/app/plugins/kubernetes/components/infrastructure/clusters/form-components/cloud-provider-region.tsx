import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'

const CloudProviderRegionField = ({
  cloudProviderType,
  onChange,
  values,
  wizardContext,
  disabled,
  required = true,
}: Props) => (
  <PicklistField
    id="region"
    label="Region"
    DropdownComponent={CloudProviderRegionPicklist}
    type={cloudProviderType}
    cloudProviderId={values.cloudProviderId}
    onChange={onChange}
    disabled={disabled === undefined ? !values.cloudProviderId : disabled}
    required={required}
    value={wizardContext.region}
  />
)

interface Props {
  cloudProviderType: string
  onChange: (value, label) => void
  values: any
  wizardContext: any
  disabled?: boolean
  required?: boolean
}

export default CloudProviderRegionField
