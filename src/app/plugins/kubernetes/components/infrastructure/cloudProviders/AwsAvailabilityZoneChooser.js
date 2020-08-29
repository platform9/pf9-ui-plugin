import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr, projectAs } from 'utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import MultiSelect from 'core/components/MultiSelect'
import { loadCloudProviderRegionDetails } from 'k8s/components/infrastructure/cloudProviders/actions'

const AwsAvailabilityZoneChooser = forwardRef(
  ({ cloudProviderId, cloudProviderRegionId, ...rest }, ref) => {
    const [details] = useDataLoader(loadCloudProviderRegionDetails, {
      cloudProviderId,
      cloudProviderRegionId,
    })

    const azs = pathStrOr([], '0.azs', details)
    const regions = projectAs({ label: 'ZoneName', value: 'ZoneName' }, azs)

    return (
      <MultiSelect
        className="validatedFormInput"
        label="Availability Zones"
        options={regions}
        {...rest}
      />
    )
  },
)

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
