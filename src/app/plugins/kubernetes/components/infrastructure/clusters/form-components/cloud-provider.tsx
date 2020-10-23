import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderPicklist from 'k8s/components/common/CloudProviderPicklist'

const CloudProviderField = ({ cloudProviderType, setWizardContext }) => (
  <PicklistField
    DropdownComponent={CloudProviderPicklist}
    id="cloudProviderId"
    label="Cloud Provider"
    onChange={(value) => setWizardContext({ cloudProviderId: value })}
    info="Nodes will be provisioned using this cloud provider."
    type={cloudProviderType}
    required
  />
)

export default CloudProviderField
