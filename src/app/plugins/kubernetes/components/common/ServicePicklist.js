import React, { useMemo } from 'react'
import Picklist from 'core/components/Picklist'
import { projectAs } from 'utils/fp'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'

const ServicePicklist = ({ loading, clusterId, ...rest }) => {
  const [services, servicesLoading] = useDataLoader('services', { clusterId })
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
  ...Picklist.propTypes,
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
