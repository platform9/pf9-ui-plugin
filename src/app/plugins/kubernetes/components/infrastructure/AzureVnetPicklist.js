import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { propEq } from 'ramda'
import { pathStrOr } from 'app/utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import Picklist from 'core/components/Picklist'
import { loadCloudProviderRegionDetails } from './actions'

const AzureVnetPicklist = forwardRef(({
  cloudProviderId, cloudProviderRegionId, resourceGroup, hasError, errorMessage, ...rest
}, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })

  const networks = pathStrOr([], '0.virtualNetworks', details)
  const netsMatchingResourceGroup = networks.filter(propEq('resourceGroup', resourceGroup))
  const options = netsMatchingResourceGroup.map(x => ({ label: x.name, value: x.name }))

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

AzureVnetPicklist.propTypes = {
  id: PropTypes.string.isRequired,
  cloudProviderId: PropTypes.string,
  cloudProviderRegionId: PropTypes.string,
  resourceGroup: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default AzureVnetPicklist
