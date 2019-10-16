import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr } from 'app/utils/fp'
import { identity, intersection } from 'ramda'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import Picklist from 'core/components/Picklist'
import { loadCloudProviderRegionDetails } from './actions'

const AzureSkuPicklist = forwardRef(({
  cloudProviderId, cloudProviderRegionId, selectedZones, filterByZones, hasError, errorMessage, ...rest
}, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })

  const skus = pathStrOr([], '0.skus', details)
  const zonesFilter = sku => intersection(pathStrOr([], 'locationInfo.0.zones', sku), selectedZones).length > 0
  const options = skus
    .filter(filterByZones ? zonesFilter : identity)
    .map(x => ({ label: x.name, value: x.name }))

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

AzureSkuPicklist.propTypes = {
  id: PropTypes.string.isRequired,
  cloudProviderId: PropTypes.string,
  cloudProviderRegionId: PropTypes.string,
  filterByZones: PropTypes.bool,
  selectedZones: PropTypes.arrayOf(PropTypes.string),
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

AzureSkuPicklist.defaultProps = {
  selectedZones: [],
}

export default AzureSkuPicklist
