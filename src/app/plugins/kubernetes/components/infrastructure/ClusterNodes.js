import React, { useMemo } from 'react'
import { withRouter } from 'react-router'
import { compose, pluck } from 'ramda'
// This table essentially has the same functionality as the <NodesList>
// except that it is only the nodes from the a single cluster.
import { columns } from './NodesListPage'
import useDataLoader from 'core/hooks/useDataLoader'
import createListTableComponent from 'core/helpers/createListTableComponent'

const ListTable = createListTableComponent({
  title: 'Cluster Nodes',
  emptyText: 'No instances found.',
  name: 'ClusterNodes',
  columns,
  uniqueIdentifier: 'uuid',
})

const ClusterNodes = ({ match }) => {
  const [clusters, loadingClusters] = useDataLoader('clusters')
  const [nodes, loadingNodes] = useDataLoader('nodes')
  const clusterNodes = useMemo(() => {
    const cluster = clusters.find(cluster => cluster.uuid === match.params.id)
    const clusterNodesUids = pluck('uuid', cluster.nodes)
    return nodes.filter(node => clusterNodesUids.includes(node.uuid))
  }, [clusters, nodes, match])

  return <ListTable data={clusterNodes} loading={loadingClusters || loadingNodes} />
}

export default compose(
  withRouter,
)(ClusterNodes)
