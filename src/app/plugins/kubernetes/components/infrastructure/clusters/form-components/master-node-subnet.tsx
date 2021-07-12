import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const MasterNodeSubnetField = ({ dropdownComponent, values }) => (
  <PicklistField
    DropdownComponent={dropdownComponent}
    disabled={!(values.cloudProviderId && values.region)}
    id="masterSubnetName"
    label="Master node subnet"
    cloudProviderId={values.cloudProviderId}
    cloudProviderRegionId={values.region}
    resourceGroup={values.vnetResourceGroup}
    vnetName={values.vnetName}
    info="Select the subnet for your master nodes. Can be the same as worker node subnet."
    required
  />
)

export default MasterNodeSubnetField
