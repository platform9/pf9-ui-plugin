import React, { forwardRef, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr } from 'utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import Picklist from 'core/components/Picklist'
import { loadCloudProviderRegionDetails } from 'k8s/components/infrastructure/cloudProviders/actions'

const ClusterDomainPicklist = forwardRef(
  ({ cloudProviderId, cloudProviderRegionId, onChange, ...rest }, ref) => {
    const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, {
      cloudProviderId,
      cloudProviderRegionId,
    })

    const domains = useMemo(() => pathStrOr([], '0.domains', details), [details])
    const options = useMemo(() => domains.map((x) => ({ label: x.Name, value: x.Id })), [domains])

    const handleChange = (value) => {
      const option = options.find((x) => x.value === value)
      onChange && onChange(value, option && option.label)
    }

    // useEffect(() => {
    //   onChange && onChange('')
    // }, [cloudProviderId, cloudProviderRegionId])

    return (
      <Picklist {...rest} onChange={handleChange} ref={ref} loading={loading} options={options} />
    )
  },
)

ClusterDomainPicklist.propTypes = {
  id: PropTypes.string.isRequired,
  cloudProviderId: PropTypes.string,
  cloudProviderRegionId: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default ClusterDomainPicklist
