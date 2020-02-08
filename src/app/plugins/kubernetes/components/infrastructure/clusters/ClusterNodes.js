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

const tableColumns = columns.filter(
  (column) => !['clusterName', 'isSpotInstance'].includes(column.id),
)

const ClusterNodes = () => {
  const { match } = useReactRouter()
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

  const NodesTable = createListTableComponent({
    title: 'Nodes',
    name: 'nodes',
    columns: tableColumns,
    emptyText: 'No instances found.',
    uniqueIdentifier: 'uuid',
    onReload: handleRefresh,
    showCheckboxes: false,
  })

  return (
    <Progress loading={loadingClusters || loadingNodes}>
      <NodesTable data={nodesInCluster} />
    </Progress>
  )
}

export default ClusterNodes
