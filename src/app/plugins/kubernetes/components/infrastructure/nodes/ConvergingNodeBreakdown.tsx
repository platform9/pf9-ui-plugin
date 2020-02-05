import React, { useState, FC, useMemo, useCallback } from 'react'
import useReactRouter from 'use-react-router'
import {
  Table, TableHead, TableRow, TableCell, TableBody, Radio, Typography, Card, Tooltip,
} from '@material-ui/core'
import ProgressBar from 'core/components/progress/ProgressBar'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/styles'
import ExternalLink from 'core/components/ExternalLink'
import { Tasks } from '../clusters/TaskStatusDialog'
import pluck from 'ramda/es/pluck'
import { emptyArr } from 'utils/fp'
import { clusterActions } from '../clusters/actions'
import { loadNodes } from './actions'
import useDataLoader from 'core/hooks/useDataLoader'
import PollingData from 'core/components/PollingData'
import { IUseDataLoader, ICombinedNode } from './model'
import { ICluster } from '../clusters/model'
import { renderNodeHealthStatus } from './NodesListPage'

const useStyles = makeStyles<Theme, {}>((theme) => ({
  gridContainer: {
    marginTop: theme.spacing(2),
  },
  ellipsis: {
    maxWidth: 160,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
  },
  renderPane: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '300px',
    transition: 'all 2s ease-out',
    minWidth: '400px',
    background: theme.palette.background.paper,
  },
  divider: {
    backgroundColor: 'transparent',
    width: 5,
    borderRadius: '10px',
    boxShadow: 'inset 0px 0px 2px 1px rgba(0,0,0,0.25)',
  },
  flex: {
    display: 'flex',
  },
  paneHeaderStatus: {
    paddingLeft: theme.spacing(3),
  },
  paneHeaderTitle: {
    padding: theme.spacing(2, 2, 0.5, 2),
    display: 'grid',
    gridGap: theme.spacing(2),
    gridTemplateColumns: '1fr 100px',
    alignItems: 'center',
  },
  paneHeader: {
    display: 'grid',
    gridTemplateRows: '1fr 24px',
    alignItems: 'center',
  },
  paneBody: {
    padding: theme.spacing(2),
  },
  tablePolling: {
    gridColumn: 3,
  },
  tableChooser: {
    marginTop: theme.spacing(2),
    display: 'grid',
    gridTemplateRows: `
      22px 1fr
    `,
    gridTemplateColumns: `
      minmax(400px, 450px)
      5px
      minmax(400px, 600px)
    `,
    gridGap: theme.spacing(2),
  },
}))

const getTaskContent = (
  all: string[],
  completed: string[],
  failed: string,
  message: string,
): { message: string; color: 'success' | 'primary' | 'error' } => {
  // TODO get backend to update the last_failed_task to be null rather than 'None'

  const failedIdx = all.indexOf(failed)
  const hasFailed = !!failed && failed !== 'None'
  if (all.length === 0) {
    return { color: 'primary', message: 'Waiting for node...' }
  }
  if (all.length === completed.length) {
    return { color: 'success', message: `Completed all ${all.length} tasks successfully` }
  }
  if (completed.length < all.length && !hasFailed) {
    return { color: 'primary', message: `Steps ${completed.length} of ${all.length}: ${message}` }
  }
  return { color: 'error', message: `failed at step ${failedIdx + 1} (out of ${all.length})` }
}
const oneSecond = 1000

const sortNodesByTasks = (prevNode: ICombinedNode, currNode: ICombinedNode) => {
  const { name: prevName = '' } = prevNode
  const { name: currName = '' } = currNode
  return prevName.toLowerCase().localeCompare(currName.toLowerCase())
}

export const ConvergingNodesWithTasksToggler: FC = () => {
  const { match, location } = useReactRouter()
  const searchParams = new URLSearchParams(location.search)
  const linkedNodeUUID = searchParams.get('node') || null

  const [selectedNode, setSelectedNode] = useState(null)
  const [clusters, loadingClusters, reloadClusters]: IUseDataLoader<ICluster> = useDataLoader(
    clusterActions.list,
  ) as any
  const [nodes, loadingNodes, reloadNodes]: IUseDataLoader<ICombinedNode> = useDataLoader(
    loadNodes,
  ) as any
  const cluster = clusters.find((cluster) => cluster.uuid === match.params.id)
  const nodesInCluster = useMemo(() => {
    if (cluster) {
      const clusterNodesUids = pluck<'uuid', ICombinedNode>('uuid', cluster.nodes)
      const filteredNodes = nodes
        .filter((node) => clusterNodesUids.includes(node.uuid))
        .sort(sortNodesByTasks)

      const uuid = selectedNode ? selectedNode.uuid : linkedNodeUUID || filteredNodes[0]?.uuid
      const nodeToSelect = filteredNodes.find((node) => node.uuid === uuid)
      setSelectedNode(nodeToSelect || null) // always update as node data refreshes

      return filteredNodes
    }
    return emptyArr
  }, [cluster, nodes, selectedNode])

  const handleReload = useCallback(
    (ignoreCache) => {
      reloadClusters(ignoreCache)
      return reloadNodes(ignoreCache)
    },
    [reloadClusters, reloadNodes],
  )

  const {
    ellipsis,
    renderPane,
    divider,
    paneHeader,
    paneHeaderTitle,
    paneHeaderStatus,
    paneBody,
    tableChooser,
    tablePolling,
  } = useStyles({})
  const selectedNodeAllTasks =
    selectedNode?.combined?.resmgr?.extensions?.pf9_kube_status?.data?.all_tasks || []
  const selectedNodeCompletedTasks =
    selectedNode?.combined?.resmgr?.extensions?.pf9_kube_status?.data?.completed_tasks || []
  const lastSelectedNodesFailedTask =
    selectedNode?.combined?.resmgr?.extensions?.pf9_kube_status?.data?.last_failed_task || []
  const selectedNodeTitle = `${selectedNode?.name || 'Choose a node to continue'}${
    selectedNode?.isMaster ? ' (master)' : ''
  }`

  return (
    <div className={tableChooser}>
      <div className={tablePolling}>
        <PollingData
          loading={loadingNodes || loadingClusters}
          onReload={handleReload}
          refreshDuration={oneSecond * 10}
        />
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>Hostname & IP</TableCell>
            <TableCell>Installation Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nodesInCluster &&
            nodesInCluster.map((node) => {
              const lastFailedTask =
                node?.combined?.resmgr?.extensions?.pf9_kube_status?.data?.last_failed_task || null
              const allTasks =
                node?.combined?.resmgr?.extensions?.pf9_kube_status?.data?.all_tasks || []
              const completedTasks =
                node?.combined?.resmgr?.extensions?.pf9_kube_status?.data?.completed_tasks || []
              const percentComplete = (completedTasks.length / allTasks.length) * 100
              const lastCompletedStep = allTasks[completedTasks.length - 1]
              const { color: progressColor, message: progressLabel } = getTaskContent(
                allTasks,
                completedTasks,
                lastFailedTask,
                lastCompletedStep,
              )
              return (
                <TableRow key={node.uuid} onClick={() => setSelectedNode(node)}>
                  <TableCell padding="checkbox">
                    <Radio checked={selectedNode && selectedNode.uuid === node.uuid} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={node.name}>
                      <span className={ellipsis}>{node.name}</span>
                    </Tooltip>
                    <span>({node.primaryIp})</span>
                  </TableCell>
                  <TableCell>
                    <ProgressBar
                      compact
                      width={'100%'}
                      percent={percentComplete}
                      color={progressColor}
                      label={
                        <Tooltip title={progressLabel}>
                          <span className={ellipsis}>{progressLabel}</span>
                        </Tooltip>
                      }
                    />
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
      <div className={divider} />
      <Card className={renderPane}>
        <header className={paneHeader}>
          <div className={paneHeaderTitle}>
            <Tooltip title={selectedNodeTitle || ''}>
              <Typography variant="h6">{selectedNodeTitle}</Typography>
            </Tooltip>
            {!!selectedNode && (
              <ExternalLink url={selectedNode?.logs} icon="clipboard-list">
                View Logs
              </ExternalLink>
            )}
          </div>
          <div className={paneHeaderStatus}>
            {!!selectedNode && renderNodeHealthStatus(null, selectedNode)}
          </div>
        </header>
        <article className={paneBody}>
          {selectedNode && (
            <Tasks
              allTasks={selectedNodeAllTasks}
              lastFailedTask={lastSelectedNodesFailedTask}
              completedTasks={selectedNodeCompletedTasks}
            />
          )}
        </article>
      </Card>
    </div>
  )
}
