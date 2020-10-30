import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const MasterNodeInstanceTypeField = ({ dropdownComponent, values }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(values.cloudProviderId && values.region)}
    id="masterFlavor"
    label="Master Node Instance Type"
    cloudProviderId={values.cloudProviderId}
    cloudProviderRegionId={values.region}
    info="Choose an instance type used by master nodes."
    required
  />
)

export default MasterNodeInstanceTypeField
