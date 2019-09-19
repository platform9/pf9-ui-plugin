import React, { forwardRef, useMemo } from 'react'
import Picklist from 'core/components/Picklist'
import { projectAs } from 'utils/fp'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'
import { serviceAccountActions } from 'k8s/components/prometheus/actions'
import { omit } from 'ramda'

const ServiceAccountPicklist = forwardRef(({ loading, clusterId, namespace, ...rest }, ref) => {
  const [services, servicesLoading] = useDataLoader(serviceAccountActions.list, {
    clusterId,
    namespace,
  })
  const options = useMemo(() =>
    projectAs({ label: 'name', value: 'name' }, services),
  [services])

  return <Picklist
    {...rest}
    ref={ref}
    loading={loading || servicesLoading}
    options={options}
  />
})

ServiceAccountPicklist.propTypes = {
  ...omit(['options'], Picklist.propTypes),
  name: PropTypes.string,
  label: PropTypes.string,
  clusterId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  namespace: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
}

ServiceAccountPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'serviceId',
  label: 'Current Service',
}

export default ServiceAccountPicklist
