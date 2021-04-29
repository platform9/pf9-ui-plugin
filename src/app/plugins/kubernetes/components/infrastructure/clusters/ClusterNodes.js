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
import { isAdmin } from './helpers'
import RemoteSupportDialog from '../nodes/RemoteSupportDialog'

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

  const NodesTable = useMemo(
    () =>
      createListTableComponent({
        title: 'Nodes',
        name: 'nodes',
        columns: tableColumns,
        emptyText: 'Nothing yet, waiting for nodes...',
        uniqueIdentifier: 'uuid',
        searchTargets: ['name', 'uuid'],
        onReload: handleRefresh,
        showCheckboxes: true,
        multiSelection: false,
        batchActions: [
          {
            cond: isAdmin,
            icon: 'headset',
            label: 'Remote Support',
            dialog: RemoteSupportDialog,
          },
        ],
      }),
    [handleRefresh],
  )

  return (
    <Progress loading={loadingClusters || loadingNodes}>
      <NodesTable data={nodesInCluster} />
    </Progress>
  )
}

export default ClusterNodes
