import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { compose, pathStrOr, projectAs } from 'app/utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import MultiSelect from 'core/components/MultiSelect'
import { withInfoTooltip } from 'core/components/InfoTooltip'
import { loadCloudProviderRegionDetails } from './actions'

const AwsAvailabilityZoneChooser = forwardRef(({ cloudProviderId, cloudProviderRegionId, ...rest }, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })
  const [values, setValues] = React.useState([])

  const azs = pathStrOr([], '0.azs', details)
  const regions = projectAs({ label: 'ZoneName', value: 'ZoneName' }, azs)
  // TOOD: extract the region names

  return (
    <>
      <MultiSelect
        label="Availability Zones"
        options={regions}
        values={values}
        onChange={setValues}
        {...rest}
      />
      <pre>{JSON.stringify(regions, null, 4)}</pre>
    </>
  )
})

/*
*/
AwsAvailabilityZoneChooser.propTypes = {
  id: PropTypes.string.isRequired,
  cloudProviderId: PropTypes.string,
  cloudProviderRegionId: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withInfoTooltip,
  withFormContext,
)(AwsAvailabilityZoneChooser)
