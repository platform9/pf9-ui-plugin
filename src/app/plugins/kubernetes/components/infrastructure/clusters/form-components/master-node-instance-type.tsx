import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import AwsRegionFlavorPicklist from '../aws/AwsRegionFlavorPicklist'

const MasterNodeInstanceTypeField = ({ cloudProviderId, cloudProviderRegionId }) => (
  <PicklistField
    DropdownComponent={AwsRegionFlavorPicklist}
    disabled={!(cloudProviderId && cloudProviderRegionId)}
    id="masterFlavor"
    label="Master Node Instance Type"
    cloudProviderId={cloudProviderId}
    cloudProviderRegionId={cloudProviderRegionId}
    info="Choose an instance type used by master nodes."
    required
  />
)

export default MasterNodeInstanceTypeField
