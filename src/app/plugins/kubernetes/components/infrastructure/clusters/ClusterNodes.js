import React, { useMemo, useState, useCallback } from 'react'
import { pluck, partition } from 'ramda'
// This table essentially has the same functionality as the <NodesList>
// except that it is only the nodes from the a single cluster.
import { columns } from '../nodes/NodesListPage'
import useDataLoader from 'core/hooks/useDataLoader'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { emptyArr } from 'utils/fp'
import useReactRouter from 'use-react-router'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import ClusterNodesOverview from './ClusterNodesOverview'
import useToggler from 'core/hooks/useToggler'
import TaskStatusDialog from './TaskStatusDialog'

const ClusterNodes = () => {
  const { match } = useReactRouter()
  const [selectedNode, setSelectedNode] = useState()
  const [showTaskDialog, toggleTaskDialog] = useToggler()
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const [nodes, loadingNodes, reload] = useDataLoader(loadNodes)
  const handleRefresh = useCallback(() => reload(true), [reload])
  const cluster = clusters.find(cluster => cluster.uuid === match.params.id)
  const [masterNodes, workerNodes] = useMemo(() => {
    if (cluster) {
      const clusterNodesUids = pluck('uuid', cluster.nodes)
      const clusterNodes = nodes.filter(node => clusterNodesUids.includes(node.uuid))
      const isMasterNode = node => node.isMaster === 1
      return partition(isMasterNode, clusterNodes)
    }
    return emptyArr
  }, [cluster, nodes, match])

  const commonTableProperties = {
    emptyText: 'No instances found.',
    uniqueIdentifier: 'uuid',
    onReload: handleRefresh,
    showCheckboxes: false,
    compactTable: true,
  }

  const removeColumnIds = (columns, ids) => columns.filter(column => !ids.includes(column.id))

  const addTaskStatusModal = (columns) => {
    const healthStatusColumn = { ...columns.find(column => column.id === 'healthStatus') }
    const originalRender = healthStatusColumn.render
    const updatedRender = (_, node) => {
      setSelectedNode(node)
      return originalRender(_, node, toggleTaskDialog)
    }

    return columns.map(column => column.id === 'healthStatus' ? { ...column, render: updatedRender } : column)
  }

  const masterNodesColumns = addTaskStatusModal(removeColumnIds(columns, ['isMaster']))
  const workerNodesColumns = addTaskStatusModal(removeColumnIds(columns, ['isMaster', 'api_responding']))

  const MasterNodesTable = createListTableComponent({
    title: 'Master Nodes',
    name: 'MasterNodes',
    columns: masterNodesColumns,
    ...commonTableProperties,
  })

  const WorkerNodesTable = createListTableComponent({
    title: 'Worker Nodes',
    name: 'WorkerNodes',
    columns: workerNodesColumns,
    ...commonTableProperties,
  })

  return (
    <div>
      <ClusterNodesOverview cluster={cluster} />
      <h2>Master Nodes</h2>
      <MasterNodesTable data={masterNodes} loading={loadingClusters || loadingNodes} />
      <h2>Worker Nodes</h2>
      <WorkerNodesTable data={workerNodes} loading={loadingClusters || loadingNodes} />
      <TaskStatusDialog isOpen={showTaskDialog} toggleOpen={toggleTaskDialog} node={selectedNode} />
    </div>
  )
}

export default ClusterNodes
