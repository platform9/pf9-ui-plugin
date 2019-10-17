import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr } from 'app/utils/fp'
import { uniq } from 'ramda'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import Picklist from 'core/components/Picklist'
import { loadCloudProviderRegionDetails } from './actions'

const AzureResourceGroupPicklist = forwardRef(({
  cloudProviderId, cloudProviderRegionId, hasError, errorMessage, ...rest
}, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })

  const networks = pathStrOr([], '0.virtualNetworks', details)
  // Azure might have more than 1 virtualNetwork with the same resourceGroup be sure to use 'uniq'
  const options = uniq(networks.map(x => ({ label: x.resourceGroup, value: x.resourceGroup })))

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

AzureResourceGroupPicklist.propTypes = {
  id: PropTypes.string.isRequired,
  cloudProviderId: PropTypes.string,
  cloudProviderRegionId: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default AzureResourceGroupPicklist
