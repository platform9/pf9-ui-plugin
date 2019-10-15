import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import MultiSelect from 'core/components/MultiSelect'

const AzureAvailabilityZoneChooser = forwardRef(({ onChange, ...rest }, ref) => {
  const [values, setValues] = React.useState([])

  const handleValuesChange = values => {
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

AzureAvailabilityZoneChooser.propTypes = {
  id: PropTypes.string.isRequired,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default AzureAvailabilityZoneChooser
