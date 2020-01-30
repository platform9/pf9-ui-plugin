import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr, projectAs } from 'utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import MultiSelect from 'core/components/MultiSelect'
import { loadCloudProviderRegionDetails } from 'k8s/components/infrastructure/cloudProviders/actions'

const AwsAvailabilityZoneChooser = forwardRef(({ cloudProviderId, cloudProviderRegionId, onChange, ...rest }, ref) => {
  const [details] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })
  const [values, setValues] = React.useState([])

  const handleValuesChange = values => {
    setValues(values)
    onChange && onChange(values)
  }

  const azs = pathStrOr([], '0.azs', details)
  const regions = projectAs({ label: 'ZoneName', value: 'ZoneName' }, azs)

  return (
    <MultiSelect
      label="Availability Zones"
      options={regions}
      values={values}
      onChange={handleValuesChange}
      {...rest}
    />
  )
})

AwsAvailabilityZoneChooser.propTypes = {
  id: PropTypes.string.isRequired,
  cloudProviderId: PropTypes.string,
  cloudProviderRegionId: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}
AwsAvailabilityZoneChooser.displayName = 'AwsAvailabilityZoneChooser'

export default AwsAvailabilityZoneChooser
