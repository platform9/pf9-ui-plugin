import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import AwsRegionFlavorPicklist from '../aws/AwsRegionFlavorPicklist'

const MasterNodeInstanceTypeField = ({ wizardContext }) => (
  <PicklistField
    DropdownComponent={AwsRegionFlavorPicklist}
    disabled={!(wizardContext.cloudProviderId && wizardContext.cloudProviderRegionId)}
    id="masterFlavor"
    label="Master Node Instance Type"
    cloudProviderId={wizardContext.cloudProviderId}
    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
    info="Choose an instance type used by master nodes."
    required
  />
)

export default MasterNodeInstanceTypeField
