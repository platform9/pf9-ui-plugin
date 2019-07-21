import React from 'react'
import { withRouter } from 'react-router'
import { compose, pluck } from 'ramda'
// This table essentially has the same functionality as the <NodesList>
// except that it is only the nodes from the a single cluster.
import { columns } from './NodesListPage'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { loadNodes } from 'k8s/components/infrastructure/actions'
import clusterizedDataLoader from 'k8s/helpers/clusterizedDataLoader'

const ListTable = createListTableComponent({
  title: 'Cluster Nodes',
  emptyText: 'No instances found.',
  name: 'ClusterNodes',
  columns,
  uniqueIdentifier: 'uuid',
})

const ClusterNodes = ({ data: { clusters, nodes }, match }) => {
  const cluster = clusters.find(x => x.uuid === match.params.id)
  const clusterNodesUids = pluck('uuid', cluster.nodes)
  const clusterNodes = nodes.filter(node => clusterNodesUids.includes(node.uuid))

  return <ListTable data={clusterNodes} />
}

export default compose(
  clusterizedDataLoader('nodes', loadNodes),
  withRouter,
)(ClusterNodes)
