import React from 'react'
import TextField from 'core/components/validatedForm/TextField'

const CustomAmiField = () => (
  <TextField
    id="customAmi"
    label="Custom AMI ID"
    info="Use a custom AMI (leave blank for none) to create cluster nodes with, in case our AMI defaults are not available for you."
  />
)

export default CustomAmiField
