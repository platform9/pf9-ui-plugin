import React, { useMemo, useCallback } from 'react'
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
import Progress from 'core/components/progress/Progress'
import { routes } from 'core/utils/routes'

const tableColumns = columns.filter(
  (column) => !['clusterName', 'isSpotInstance'].includes(column.id),
)

const ClusterNodes = (props) => {
  const { history, match } = useReactRouter()
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
  }, [cluster, nodes])

  const handleViewNodeHealth = (node) => {
    history.push(routes.cluster.convergingNodes.path({ id: cluster.uuid, node: node.uuid }))
  }

  const addLinkToNodeHealth = (columns) => {
    const healthStatusColumn = columns.find((column) => column.id === 'healthStatus')
    const originalRender = healthStatusColumn.render
    const updatedRender = (_, node) => {
      return originalRender(_, node, handleViewNodeHealth)
    }

    return columns.map((column) =>
      column.id === 'healthStatus' ? { ...column, render: updatedRender } : column,
    )
  }

  const nodeColumns = addLinkToNodeHealth(tableColumns)

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
      <NodesTable data={nodesInCluster} source={props.source} />
    </Progress>
  )
}

export default ClusterNodes
