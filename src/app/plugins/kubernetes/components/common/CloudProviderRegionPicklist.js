import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { pluck } from 'ramda'
import { loadCloudProviderDetails } from 'k8s/components/infrastructure/cloudProviders/actions'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
// TODO use the CloudProviders enum to strongly type this type field once moved to TS
const CloudProviderRegionPicklist = forwardRef(({ cloudProviderId, type, ...rest }, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderDetails, { cloudProviderId })
  const displayField = type === 'azure' ? 'DisplayName' : 'RegionName'
  const options = pluck(displayField, details)

  return <Picklist {...rest} ref={ref} loading={loading} options={options} />
})

CloudProviderRegionPicklist.propTypes = {
  ...Picklist.propTypes,
  cloudProviderId: PropTypes.string,
}

CloudProviderRegionPicklist.defaultProps = {
  showAll: true,
  showNone: false,
  formField: true,
  variant: 'outlined',
}

export default CloudProviderRegionPicklist
