import React, { useMemo } from 'react'
import Picklist from 'core/components/Picklist'
import { projectAs } from 'utils/fp'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'
import { serviceAccountsDataKey } from 'k8s/components/prometheus/actions'
import { omit } from 'ramda'

const ServicePicklist = ({ loading, clusterId, namespace, ...rest }) => {
  const [services, servicesLoading] = useDataLoader(serviceAccountsDataKey, {
    clusterId,
    namespace,
  })
  const options = useMemo(() =>
    projectAs({ label: 'name', value: 'name' }, services),
  [services])

  return <Picklist
    {...rest}
    loading={loading || servicesLoading}
    options={options}
  />
}

ServicePicklist.propTypes = {
  ...omit(['options'], Picklist.propTypes),
  name: PropTypes.string,
  label: PropTypes.string,
  clusterId: PropTypes.number,
}

ServicePicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'serviceId',
  label: 'Current Service',
}

export default ServicePicklist
