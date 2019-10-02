import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { compose, pathStrOr } from 'app/utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import Picklist from 'core/components/Picklist'
import { withInfoTooltip } from 'core/components/InfoTooltip'
import { loadCloudProviderRegionDetails } from './actions'

const AwsClusterSshKeyPicklist = forwardRef(({
  cloudProviderId, cloudProviderRegionId, hasError, errorMessage, ...rest
}, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })

  const keypairs = pathStrOr([], '0.keyPairs', details)
  const options = keypairs.map(x => ({ label: x.KeyName, value: x.KeyName }))

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

AwsClusterSshKeyPicklist.propTypes = {
  id: PropTypes.string.isRequired,
  cloudProviderId: PropTypes.string,
  cloudProviderRegionId: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withInfoTooltip,
)(AwsClusterSshKeyPicklist)
