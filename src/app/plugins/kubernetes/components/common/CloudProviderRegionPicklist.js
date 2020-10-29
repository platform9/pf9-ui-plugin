import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { pluck } from 'ramda'
import { loadCloudProviderDetails } from 'k8s/components/infrastructure/cloudProviders/actions'
import { CloudProviders } from '../infrastructure/cloudProviders/model'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
// TODO use the CloudProviders enum to strongly type this type field once moved to TS
const CloudProviderRegionPicklist = forwardRef(({ cloudProviderId, type, ...rest }, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: cloudProviderId,
  })

  const displayField = cloudProviderId && type === CloudProviders.Aws ? 'RegionName' : 'DisplayName'
  const options = details.map((detail) => ({
    label: detail[displayField],
    value: detail.RegionName,
  }))

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
