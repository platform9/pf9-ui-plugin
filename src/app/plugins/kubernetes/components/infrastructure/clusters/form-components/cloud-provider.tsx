import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderPicklist from 'k8s/components/common/CloudProviderPicklist'

const CloudProviderField = ({ cloudProviderType, wizardContext, setWizardContext, onChange }) => {
  const defaultOnChange = (value) => setWizardContext({ cloudProviderId: value })
  return (
    <PicklistField
      DropdownComponent={CloudProviderPicklist}
      id="cloudProviderId"
      label="Cloud Provider"
      info="Nodes will be provisioned using this cloud provider."
      type={cloudProviderType}
      value={wizardContext.cloudProviderId}
      onChange={!!onChange ? onChange : defaultOnChange}
      required
    />
  )
}

export default CloudProviderField
