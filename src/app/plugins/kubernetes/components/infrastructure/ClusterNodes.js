import React from 'react'
import { withRouter } from 'react-router'
import { compose, pathOr } from 'ramda'
import { loadClusters } from './actions'
// This table essentially has the same functionality as the <NodesList>
// except that it is only the nodes from the a single cluster.
import { columns } from './NodesListPage'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { loadNodes } from 'k8s/components/infrastructure/actions'
import withDataLoader from 'core/hocs/withDataLoader'
import withDataMapper from 'core/hocs/withDataMapper'
import { mapByClusterId } from 'k8s/helpers/clusterizedDataLoader'
import { withAppContext } from 'core/AppContext'

const ListTable = createListTableComponent({
  title: 'Cluster Nodes',
  emptyText: 'No instances found.',
  name: 'ClusterNodes',
  columns,
  uniqueIdentifier: 'uuid',
})

const ClusterNodes = ({ data, match }) => {
  const cluster = data.clusters.find(x => x.uuid === match.params.id)
  const nodes = cluster.nodes.map(node => data.nodes.find(x => x.uuid === node.uuid))
  return <ListTable data={nodes} />
}

export default compose(
  withRouter,
  withAppContext,
  withDataLoader({ clusters: loadClusters, nodes: loadNodes }),
  withDataMapper({
    clusters: pathOr([], ['context', 'clusters']),
    nodes: mapByClusterId('nodes'),
  }),
)(ClusterNodes)
