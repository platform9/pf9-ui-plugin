import React from 'react'
import { withRouter } from 'react-router'
import { withAppContext } from 'core/AppContext'
import { compose } from 'ramda'
import { loadInfrastructure } from './actions'
import { withDataLoader } from 'core/DataLoader'
import ListTable from 'core/common/list_table/ListTable'

const renderCluster = (name, node) => name + (node.isMaster ? ' (master)' : '')

const columns = [
  { id: 'uuid', label: 'UUID', display: false },
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status' },
  { id: 'primaryIp', label: 'Primary IP' },
  { id: 'clusterName', label: 'Cluster', render: renderCluster },
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
