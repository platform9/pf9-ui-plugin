import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr, projectAs } from 'utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadCloudProviderRegionDetails } from 'k8s/components/infrastructure/cloudProviders/actions'
import MultiSelect from 'core/components/MultiSelect'
import SingleSelect from 'core/components/SingleSelect'

const AwsAvailabilityZoneChooser = forwardRef(
  (
    { cloudProviderId, cloudProviderRegionId, allowMultiSelect, values, id, ...rest }: Props,
    ref,
  ) => {
    const [details] = useDataLoader(loadCloudProviderRegionDetails, {
      cloudProviderId,
      cloudProviderRegionId,
    })

    const azs = pathStrOr([], '0.azs', details)
    const regions = projectAs({ label: 'ZoneName', value: 'ZoneName' }, azs)

    const SelectComponent = allowMultiSelect ? MultiSelect : SingleSelect
    const componentProps: any = {}
    if (!allowMultiSelect && values.length === 1) componentProps.value = values[0]

    return (
      <SelectComponent
        className="validatedFormInput"
        label="Availability Zones"
        options={regions}
        values={values}
        {...componentProps}
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
  allowMultiSelect: boolean
}
AwsAvailabilityZoneChooser.displayName = 'AwsAvailabilityZoneChooser'

export default AwsAvailabilityZoneChooser
