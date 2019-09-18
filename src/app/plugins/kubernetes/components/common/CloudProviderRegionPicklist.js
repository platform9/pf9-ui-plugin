import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { pluck } from 'ramda'
import { loadCloudProviderDetails } from '../infrastructure/actions'

const CloudProviderRegionPicklist = forwardRef(({ cloudProviderId, ...rest }, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderDetails, { cloudProviderId })
  const options = pluck('RegionName', details)

  return <Picklist
    {...rest}
    ref={ref}
    loading={loading}
    options={options}
  />
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
