import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { cloudProviderActions } from '../infrastructure/actions'

const CloudProviderRegionPicklist = forwardRef(({ cloudProviderId, ...rest }, ref) => {
  console.log('Getting cloud provider details for ' + cloudProviderId)
  const [details, loading] = useDataLoader(cloudProviderActions.details, { cloudProviderId })
  console.log(details)

  const options = [
    { value: 'test', label: 'test' },
  ]


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
