import React, { useMemo, useState, useCallback } from 'react'
import { pluck } from 'ramda'
// This table essentially has the same functionality as the <NodesList>
// except that it is only the nodes from the a single cluster.
import { columns } from '../nodes/NodesListPage'
import useDataLoader from 'core/hooks/useDataLoader'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { emptyArr } from 'utils/fp'
import useReactRouter from 'use-react-router'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import useToggler from 'core/hooks/useToggler'
import TaskStatusDialog from './TaskStatusDialog'
import Progress from 'core/components/progress/Progress'

const tableColumns = columns.filter(
  (column) => !['clusterName', 'isSpotInstance'].includes(column.id),
)

const ClusterNodes = () => {
  const { match } = useReactRouter()
  const [selectedNode, setSelectedNode] = useState()
  const [showTaskDialog, toggleTaskDialog] = useToggler()
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const [nodes, loadingNodes, reload] = useDataLoader(loadNodes)
  const handleRefresh = useCallback(() => reload(true), [reload])
  const cluster = clusters.find((cluster) => cluster.uuid === match.params.id)
  const nodesInCluster = useMemo(() => {
    if (cluster) {
      const clusterNodesUids = pluck('uuid', cluster.nodes)
      return nodes.filter((node) => clusterNodesUids.includes(node.uuid))
    }
    return emptyArr
  }, [cluster, nodes, match])

  const addTaskStatusModal = (columns) => {
    const healthStatusColumn = { ...columns.find((column) => column.id === 'healthStatus') }
    const originalRender = healthStatusColumn.render
    const updatedRender = (_, node) => {
      setSelectedNode(node)
      return originalRender(_, node, toggleTaskDialog)
    }

    return columns.map((column) =>
      column.id === 'healthStatus' ? { ...column, render: updatedRender } : column,
    )
  }

  const nodeColumns = addTaskStatusModal(tableColumns)

  const NodesTable = createListTableComponent({
    title: 'Nodes',
    name: 'nodes',
    columns: nodeColumns,
    emptyText: 'No instances found.',
    uniqueIdentifier: 'uuid',
    onReload: handleRefresh,
    showCheckboxes: false,
    compactTable: true,
  })

  return (
    <Progress loading={loadingClusters || loadingNodes}>
      <NodesTable data={nodesInCluster} loading={loadingClusters || loadingNodes} />
      <TaskStatusDialog isOpen={showTaskDialog} toggleOpen={toggleTaskDialog} node={selectedNode} />
    </Progress>
  )
}

export default ClusterNodes
