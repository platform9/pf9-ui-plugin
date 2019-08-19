import React, { useMemo } from 'react'
import Picklist from 'core/components/Picklist'
import { projectAs } from 'utils/fp'
import { allKey } from 'app/constants'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'

const ClusterPicklist = ({ onChange, clusterId, onlyMasterNodeClusters, ...rest }) => {
  const [clusters, loading] = useDataLoader('clusters')
  const options = useMemo(() => projectAs(
    { label: 'name', value: 'uuid' },
    [
      { name: 'all', uuid: allKey },
      ...onlyMasterNodeClusters ? clusters.filter(c => c.hasMasterNode) : clusters,
    ],
  ), [clusters])

  return <Picklist
    {...rest}
    loading={loading}
    name="clusterId"
    label="Current Cluster"
    value={clusterId}
    onChange={onChange}
    options={options}
  />
}

ClusterPicklist.propTypes = {
  onlyMasterNodeClusters: PropTypes.bool,
  onChange: PropTypes.func,
  clusterId: PropTypes.number,
}

ClusterPicklist.defaultProps = {
  onlyMasterNodeClusters: true,
}

export default ClusterPicklist
