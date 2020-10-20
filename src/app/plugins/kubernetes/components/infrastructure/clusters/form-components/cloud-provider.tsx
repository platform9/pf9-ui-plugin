import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderPicklist from 'k8s/components/common/CloudProviderPicklist'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'

export default ({
  cloudProviderType,
  wizardContext,
  setWizardContext,
  params,
  getParamsUpdater,
}) => (
  <>
    <PicklistField
      DropdownComponent={CloudProviderPicklist}
      id="cloudProviderId"
      label="Cloud Provider"
      onChange={getParamsUpdater('cloudProviderId')}
      info="Nodes will be provisioned using this cloud provider."
      type={cloudProviderType}
      required
    />

    <PicklistField
      DropdownComponent={CloudProviderRegionPicklist}
      disabled={!params.cloudProviderId}
      id="region"
      label="Region"
      cloudProviderId={params.cloudProviderId}
      onChange={(region) => setWizardContext({ azs: [], cloudProviderRegionId: region })}
      value={wizardContext.cloudProviderRegionId}
      type={cloudProviderType}
      required
    />
  </>
)
