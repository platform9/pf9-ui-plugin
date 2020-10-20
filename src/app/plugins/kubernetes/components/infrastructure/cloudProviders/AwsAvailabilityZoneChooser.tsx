import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr, projectAs } from 'utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadCloudProviderRegionDetails } from 'k8s/components/infrastructure/cloudProviders/actions'
import MultiSelectDefault from 'core/components/MultiSelect'
const MultiSelect: any = MultiSelectDefault // types on forward ref .js file dont work well.

const AwsAvailabilityZoneChooser = forwardRef(
  ({ cloudProviderId, cloudProviderRegionId, ...rest }: Props, ref) => {
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
interface Props {
  id: string
  info: string
  cloudProviderId: string
  cloudProviderRegionId: string
  initialValue?: string | number
  updateWizard?: boolean
  values: any
  type: string
  onChange: any
  required?: boolean
}
AwsAvailabilityZoneChooser.displayName = 'AwsAvailabilityZoneChooser'

export default AwsAvailabilityZoneChooser
