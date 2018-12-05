import React from 'react'
import { withRouter } from 'react-router'
import { withAppContext } from 'core/AppContext'
import { compose } from 'ramda'
import { loadInfrastructure } from './actions'
import { withDataLoader } from 'core/DataLoader'
import { utilizationRenderer } from './NodesListPage'
import ListTable from 'core/common/list_table/ListTable'
import HostStatus from 'core/common/HostStatus'
import { localizeRole } from 'api-client/ResMgr'

const renderCluster = (name, node) => name + (node.isMaster ? ' (master)' : '')

const statusRenderer = (_, node) => {
  const fullNode = context.nodes.find(x => x.uuid === node.uuid)
  return <HostStatus host={fullNode.combined} />
}

const statsRenderer = stat => (_, node, context) => {
  const fullNode = context.nodes.find(x => x.uuid === node.uuid)
  return utilizationRenderer(stat)(_, fullNode)
}

const renderRoles = (_, node, context) => {
  const fullNode = context.nodes.find(x => x.uuid === node.uuid)
  return fullNode.combined.roles.map(localizeRole).join(', ')
}

const columns = [
  { id: 'uuid', label: 'UUID', display: false },
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status', render: statusRenderer },
  { id: 'primaryIp', label: 'Primary IP' },
  { id: 'clusterName', label: 'Cluster', render: renderCluster },
  { id: 'compute', label: 'Compute', render: statsRenderer('compute') },
  { id: 'memory', label: 'Memory', render: statsRenderer('memory') },
  { id: 'storage', label: 'Storage', render: statsRenderer('disk') },
  { id: 'roles', label: 'Assigned Roles', render: renderRoles },
]

const ClusterNodes = ({ context, data, match }) => {
  const cluster = data.find(x => x.uuid === match.params.id)
  return (
    <div>
      <ListTable
        title="Cluster Nodes"
        columns={columns}
        data={cluster.nodes}
        uniqueIdentifier="uuid"
      />
      <pre>{JSON.stringify(cluster.nodes, null, 4)}</pre>
    </div>
  )
}

export default compose(
  withRouter,
  withAppContext,
  withDataLoader({ dataKey: 'clusters', loaderFn: loadInfrastructure }),
)(ClusterNodes)
