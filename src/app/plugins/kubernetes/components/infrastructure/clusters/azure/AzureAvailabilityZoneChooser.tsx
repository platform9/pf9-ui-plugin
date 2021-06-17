import React, { forwardRef } from 'react'
import MultiSelect from 'core/components/MultiSelect'

interface Props {
  id: string
  initialValue?: string | number
  info?: string
  required?: boolean
  onChange: (value: any) => any
}

const AzureAvailabilityZoneChooser = forwardRef(({ onChange, ...rest }: Props, ref) => {
  const [values, setValues] = React.useState([])

  const handleValuesChange = (values) => {
    setValues(values)
    onChange && onChange(values)
  }

  const options = [
    { label: 'Zone 1', value: '1' },
    { label: 'Zone 2', value: '2' },
    { label: 'Zone 3', value: '3' },
  ]

  return (
    <MultiSelect
      label="Availability Zones"
      options={options}
      values={values}
      onChange={handleValuesChange}
      {...rest}
    />
  )
})

export default AzureAvailabilityZoneChooser
