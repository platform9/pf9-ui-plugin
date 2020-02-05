import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr } from 'utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import Picklist from 'core/components/Picklist'
import { loadCloudProviderRegionDetails } from 'k8s/components/infrastructure/cloudProviders/actions'

const AwsClusterSshKeyPicklist = forwardRef(
  ({ cloudProviderId, cloudProviderRegionId, ...rest }, ref) => {
    const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, {
      cloudProviderId,
      cloudProviderRegionId,
    })

    const keypairs = pathStrOr([], '0.keyPairs', details)
    const options = keypairs.map((x) => ({ label: x.KeyName, value: x.KeyName }))

    return <Picklist {...rest} ref={ref} loading={loading} options={options} />
  },
)

AwsClusterSshKeyPicklist.propTypes = {
  id: PropTypes.string.isRequired,
  cloudProviderId: PropTypes.string,
  cloudProviderRegionId: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default AwsClusterSshKeyPicklist
