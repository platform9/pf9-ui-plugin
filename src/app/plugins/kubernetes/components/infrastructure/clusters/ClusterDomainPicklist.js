import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr } from 'utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import Picklist from 'core/components/Picklist'
import { loadCloudProviderRegionDetails } from 'k8s/components/infrastructure/cloudProviders/actions'

const ClusterDomainPicklist = forwardRef(({
  cloudProviderId, cloudProviderRegionId, hasError, errorMessage, onChange, ...rest
}, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })

  const domains = pathStrOr([], '0.domains', details)
  const options = domains.map(x => ({ label: x.Name, value: x.Id }))

  const handleChange = value => {
    const option = options.find(x => x.value === value)
    onChange && onChange(value, option && option.label)
  }

  return (
    <Picklist
      {...rest}
      onChange={handleChange}
      ref={ref}
      loading={loading}
      options={options}
      error={hasError}
      helperText={errorMessage}
    />
  )
})

ClusterDomainPicklist.propTypes = {
  id: PropTypes.string.isRequired,
  cloudProviderId: PropTypes.string,
  cloudProviderRegionId: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default ClusterDomainPicklist
