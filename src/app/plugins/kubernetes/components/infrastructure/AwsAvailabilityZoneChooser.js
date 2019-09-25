import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'app/utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
// import MultiSelect from 'core/components/MultiSelect'
import { withInfoTooltip } from 'core/components/InfoTooltip'
import { loadCloudProviderRegionDetails } from './actions'

const AwsAvailabilityZoneChooser = React.forwardRef(({ cloudProviderId, cloudProviderRegionId, ...rest }, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })

  // TOOD: extract the region names

  return (
    <>
      <pre>{JSON.stringify(loading, null, 4)}</pre>
      <pre>{JSON.stringify(details, null, 4)}</pre>
    </>
  )
})

/*
 <MultiSelect
   ref={ref}
   options={options}
   values={values}
   onChange={setValues}
   {...props}
 />
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
