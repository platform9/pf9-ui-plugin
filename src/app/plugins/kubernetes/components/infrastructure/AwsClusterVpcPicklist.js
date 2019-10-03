import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr } from 'app/utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import Picklist from 'core/components/Picklist'
import { loadCloudProviderRegionDetails } from './actions'

const AwsClusterVpcPicklist = forwardRef(({
  cloudProviderId, cloudProviderRegionId, hasError, errorMessage, ...rest
}, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })

  const vpcs = pathStrOr([], '0.vpcs', details)
  const options = vpcs.map(x => ({ label: `${x.VpcName}-${x.CidrBlock}`, value: x.VpcId }))

  return (
    <Picklist
      {...rest}
      ref={ref}
      loading={loading}
      options={options}
      error={hasError}
      helperText={errorMessage}
    />
  )
})

AwsClusterVpcPicklist.propTypes = {
  id: PropTypes.string.isRequired,
  cloudProviderId: PropTypes.string,
  cloudProviderRegionId: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default AwsClusterVpcPicklist
