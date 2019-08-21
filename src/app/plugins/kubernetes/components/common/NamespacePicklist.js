import React, { useMemo } from 'react'
import Picklist from 'core/components/Picklist'
import { projectAs } from 'utils/fp'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'

const NamespacePicklist = ({ clusterId, loading, ...rest }) => {
  const [namespaces, namespacesLoading] = useDataLoader('namespaces', { clusterId })
  const options = useMemo(() => projectAs(
    { label: 'name', value: 'name' }, namespaces
  ), [namespaces])

  return <Picklist
    {...rest}
    loading={loading || namespacesLoading}
    options={options}
  />
}

NamespacePicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  clusterId: PropTypes.number,
}

NamespacePicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'namespaceId',
  label: 'Current Namespace',
}

export default NamespacePicklist
