import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

const AssignPublicIpsField = () => (
  <CheckboxField
    id="assignPublicIps"
    label="Assign public IP's"
    info="Assign a public IP for every node created on this cluster."
  />
)

export default AssignPublicIpsField
