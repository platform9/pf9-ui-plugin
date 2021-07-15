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
import RemoteSupportDialog from '../nodes/RemoteSupportDialog'
import NodeRolesPicklist from '../nodes/node-roles-picklist'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { allKey, listTablePrefs } from 'app/constants'
import { isAdmin } from './helpers'

const tableColumns = columns.filter(
  (column) => !['clusterName', 'isSpotInstance'].includes(column.id),
)

const defaultParams = {
  role: allKey,
}
const usePrefParams = createUsePrefParamsHook('Nodes', listTablePrefs)

const ClusterNodes = () => {
  const { match } = useReactRouter()
  const { params, getParamsUpdater } = usePrefParams(defaultParams)
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

  const filterByNodeRole = (node) => {
    if (params.role === allKey) {
      return true
    } else {
      return params.role === 'master' ? node.isMaster : !node.isMaster
    }
  }

  const filteredNodes = nodesInCluster.filter((node) => {
    return filterByNodeRole(node)
  })

  const NodesTable = useMemo(
    () =>
      createListTableComponent({
        title: 'Nodes',
        name: 'nodes',
        columns: tableColumns,
        emptyText: 'Nothing yet, waiting for nodes...',
        showEmptyTableText: params.role === allKey,
        uniqueIdentifier: 'uuid',
        searchTargets: ['name', 'uuid'],
        onReload: handleRefresh,
        showCheckboxes: true,
        multiSelection: false,
        filters: (
          <>
            <NodeRolesPicklist onChange={getParamsUpdater('role')} value={params.role} />
          </>
        ),
        batchActions: [
          {
            cond: isAdmin,
            icon: 'headset',
            label: 'Remote Support',
            dialog: RemoteSupportDialog,
          },
        ],
      }),
    [handleRefresh, params, getParamsUpdater],
  )

  return (
    <Progress loading={loadingClusters || loadingNodes}>
      <NodesTable data={filteredNodes} />
    </Progress>
  )
}

export default ClusterNodes
