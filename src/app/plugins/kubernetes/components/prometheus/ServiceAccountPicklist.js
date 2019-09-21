import React, { forwardRef, useMemo } from 'react'
import Picklist from 'core/components/Picklist'
import { projectAs } from 'utils/fp'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'
import { serviceAccountActions } from 'k8s/components/prometheus/actions'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
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
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  clusterId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  namespace: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

ServiceAccountPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'serviceId',
  label: 'Current Service',
}

export default ServiceAccountPicklist
