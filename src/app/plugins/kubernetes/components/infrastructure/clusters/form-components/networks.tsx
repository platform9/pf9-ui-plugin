import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const NetworksField = ({ options }) => (
  <PicklistField
    id="network"
    options={options}
    label="Network"
    info="Select existing networking resources or automatically create and assign new networking resources."
    required
  />
)

export default NetworksField
