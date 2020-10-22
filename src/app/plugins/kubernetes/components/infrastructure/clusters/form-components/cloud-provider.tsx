import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderPicklist from 'k8s/components/common/CloudProviderPicklist'

const CloudProviderField = ({ cloudProviderType, onChange, required = true }) => (
  <PicklistField
    DropdownComponent={CloudProviderPicklist}
    id="cloudProviderId"
    label="Cloud Provider"
    onChange={onChange}
    info="Nodes will be provisioned using this cloud provider."
    type={cloudProviderType}
    // value={params.cloudProviderId} //azure
    required={required}
  />
)

export default CloudProviderField
