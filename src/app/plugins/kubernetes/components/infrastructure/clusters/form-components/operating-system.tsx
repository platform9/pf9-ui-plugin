import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

export default ({ osOptions }) => (
  <PicklistField
    id="ami"
    label="Operating System"
    options={osOptions}
    info="Operating System / AMI"
    required
  />
)
