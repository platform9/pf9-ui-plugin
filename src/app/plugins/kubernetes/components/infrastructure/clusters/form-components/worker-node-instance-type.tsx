import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'
import AwsRegionFlavorPicklist from '../aws/AwsRegionFlavorPicklist'

const WorkerNodeInstanceTypeField = ({ cloudProviderId, cloudProviderRegionId }) => (
  <PicklistField
    DropdownComponent={AwsRegionFlavorPicklist}
    disabled={!(cloudProviderId && cloudProviderRegionId)}
    id="workerFlavor"
    label="Worker Node Instance Type"
    cloudProviderId={cloudProviderId}
    cloudProviderRegionId={cloudProviderRegionId}
    info="Choose an instance type used by worker nodes."
    required
  />
)

export default WorkerNodeInstanceTypeField
