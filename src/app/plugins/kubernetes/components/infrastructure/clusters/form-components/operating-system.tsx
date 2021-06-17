import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'

const operatingSystemOptions = [
  { label: 'Ubuntu', value: 'ubuntu' },
  { label: 'CentOS', value: 'centos' },
]

const OperatingSystemField = ({ options = operatingSystemOptions }) => (
  <PicklistField
    id="ami"
    label="Operating System"
    options={options}
    info="Operating System / AMI"
    required
  />
)

export default OperatingSystemField
