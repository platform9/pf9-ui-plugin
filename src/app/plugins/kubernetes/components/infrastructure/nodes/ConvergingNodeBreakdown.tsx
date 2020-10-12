import React, { useState, FC, useMemo, useCallback } from 'react'
import useReactRouter from 'use-react-router'
import { Card, Tooltip } from '@material-ui/core'
import Text from 'core/elements/text'
import ProgressBar from 'core/components/progress/ProgressBar'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/styles'
import ExternalLink from 'core/components/ExternalLink'
import { Tasks, NodeTaskStatus } from '../clusters/TaskStatusDialog'
import pluck from 'ramda/es/pluck'
import { emptyArr } from 'utils/fp'
import { clusterActions } from '../clusters/actions'
import { loadNodes } from './actions'
import useDataLoader from 'core/hooks/useDataLoader'
import PollingData from 'core/components/PollingData'
import { IUseDataLoader, INodesSelector } from './model'
import { Pf9KubeStatusData } from 'api-client/resmgr.model'
import { IClusterSelector } from '../clusters/model'
import { renderNodeHealthStatus } from './NodesListPage'
import { nodeInstallTroubleshooting } from 'k8s/links'
import NoContentMessage from 'core/components/NoContentMessage'
import clsx from 'clsx'
import ResourceUsageTables from '../common/ResourceUsageTables'

const useStyles = makeStyles<Theme, {}>((theme) => ({
  gridContainer: {
    marginTop: theme.spacing(2),
  },
  // ellipsis: {
  //   maxWidth: 160,
  //   whiteSpace: 'nowrap',
  //   overflow: 'hidden',
  //   textOverflow: 'ellipsis',
  //   display: 'block',
  // },
  renderPane: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '300px',
    transition: 'all 2s ease-out',
    minWidth: '400px',
  },
  // divider: {
  //   backgroundColor: 'transparent',
  //   width: 5,
  //   borderRadius: '10px',
  //   boxShadow: 'inset 0px 0px 2px 1px rgba(0,0,0,0.25)',
  // },
  flex: {
    display: 'flex',
  },
  paneHeaderStatus: {
    padding: theme.spacing(0, 2, 1, 2),
    display: 'flex',
    justifyContent: 'space-between',
  },
  paneHeaderTitle: {
    padding: theme.spacing(1, 2, 0, 2),
    display: 'grid',
    gridGap: theme.spacing(2),
    gridTemplateColumns: '1fr min-content',
    alignItems: 'center',
  },
  paneHeader: {
    display: 'grid',
    gridTemplateRows: '38px 1fr',
    alignItems: 'stretch',
    minHeight: 118,
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: 4,
    margin: theme.spacing(0, 2),
  },
  paneBody: {
    padding: theme.spacing(2),
  },
  tablePolling: {
    display: 'flex',
    justifyContent: 'flex-end',
    maxWidth: 1130,
  },
  tableChooser: {
    maxWidth: 1130,
    display: 'grid',
    gridTemplateColumns: `
      minmax(400px, 500px)
      minmax(400px, 1fr)
    `,
    gridGap: theme.spacing(2),
  },
  linkSpacer: {
    paddingLeft: theme.spacing(),
  },
  nodeHealthContainer: {
    // background: theme.palette.grey[200],
    display: 'grid',
    gridTemplateRows: 'repeat(auto-fill, 65px)',
    justifyItems: 'stretch',
    gridGap: 8,
  },
  nodeCard: {
    cursor: 'pointer',
    borderRadius: 4,
    border: `1px solid ${theme.palette.grey[300]}`,
    display: 'grid',
    gridTemplateColumns: 'minmax(150px, max-content) 1fr',
    alignItems: 'start',
    justifyItems: 'start',
    padding: 8,
    color: theme.palette.grey[700],

    '& > article': {
      justifySelf: 'start',
    },
    '& > div': {
      width: '100%',
      alignSelf: 'end',
    },
  },
  nodeProgressLabel: {
    alignSelf: 'end',
    marginTop: 8,
    position: 'relative',
    bottom: -4,
    textAlign: 'center',
  },
  nodeCardSelected: {
    backgroundColor: theme.palette.blue[100],
    borderColor: theme.palette.blue.main,
  },
  resourceStats: {
    alignSelf: 'center',
    ...theme.typography.body2,
  },
}))

const ResourceStats = ({ usage }) => {
  return <ResourceUsageTables usage={usage} valueOff={true} />
}

const getTaskContent = (
  all: string[],
  completed: string[],
  failed: string,
  message: string = 'Waiting for node...',
  nodeState: string,
): { message: string; color: 'success' | 'primary' | 'error' } => {
  // TODO get backend to update the last_failed_task to be null rather than 'None'

  const failedIdx = all.indexOf(failed)
  const hasFailed = !!failed && failed !== 'None'
  if (all.length === 0) {
    return { color: 'primary', message: 'Waiting for node...' }
  }
  if (failedIdx === -1 && all.length === completed.length) {
    return { color: 'success', message: `Completed all ${all.length} tasks successfully` }
  }
  if (completed.length < all.length && !hasFailed) {
    return { color: 'primary', message: `Step ${completed.length} of ${all.length}: ${message}` }
  }
  return {
    color: 'error',
    message: `${nodeState === 'retrying' ? 'Retrying' : 'Failed at'} step ${failedIdx +
      1} (out of ${all.length})`,
  }
}
const oneSecond = 1000

const sortNodesByTasks = (prevNode: INodesSelector, currNode: INodesSelector) => {
  const { name: prevName = '' } = prevNode
  const { name: currName = '' } = currNode
  return prevName.toLowerCase().localeCompare(currName.toLowerCase())
}

export const NodeHealthWithTasksToggler: FC = () => {
  const { match, location } = useReactRouter()
  const searchParams = new URLSearchParams(location.search)
  const linkedNodeUUID = searchParams.get('node') || null

  const [selectedNode, setSelectedNode] = useState(null)
  const [
    clusters,
    loadingClusters,
    reloadClusters,
  ]: IUseDataLoader<IClusterSelector> = useDataLoader(clusterActions.list) as any
  const [nodes, loadingNodes, reloadNodes]: IUseDataLoader<INodesSelector> = useDataLoader(
    loadNodes,
  ) as any
  const cluster = clusters.find((cluster) => cluster.uuid === match.params.id)
  const nodesInCluster = useMemo(() => {
    if (cluster) {
      const clusterNodesUids = pluck<'uuid', INodesSelector>('uuid', cluster.nodes)
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

  const classes = useStyles({})
  const kubeStatusData: Pf9KubeStatusData =
    selectedNode?.combined?.resmgr?.extensions?.pf9_kube_status?.data || {}
  const selectedNodeAllTasks = kubeStatusData.all_tasks || []
  const selectedNodeCompletedTasks = kubeStatusData.completed_tasks || []
  const lastSelectedNodesFailedTask = kubeStatusData.last_failed_task || []
  const nodeState = kubeStatusData.pf9_kube_node_state
  const selectedNodeTitle = `${selectedNode?.name || 'Choose a node to continue'}${
    selectedNode?.isMaster ? ' (master)' : ''
  }`
  const shouldShowStateStatus = !!nodeState && nodeState !== 'ok'
  const selectedNodeStatus = shouldShowStateStatus ? (
    <NodeTaskStatus status={nodeState}>
      {(nodeState.includes('fail') || nodeState === 'retrying') && (
        <ExternalLink className={classes.linkSpacer} url={nodeInstallTroubleshooting}>
          Troubleshooting Help
        </ExternalLink>
      )}
    </NodeTaskStatus>
  ) : (
    renderNodeHealthStatus(null, selectedNode || {})
  )

  if (!selectedNode) {
    return (
      <>
        <PollingData
          hidden
          loading={loadingNodes || loadingClusters}
          onReload={handleReload}
          refreshDuration={oneSecond * 5}
        />
        <NoContentMessage message="Nothing yet, waiting for nodes..." />
      </>
    )
  }

  return (
    <>
      <div className={classes.tablePolling}>
        <PollingData
          loading={loadingNodes || loadingClusters}
          onReload={handleReload}
          refreshDuration={oneSecond * 10}
        />
      </div>
      <div className={classes.tableChooser}>
        <div className={classes.nodeHealthContainer}>
          {nodesInCluster &&
            nodesInCluster.map((node) => {
              const currNodeKubeStatusData =
                node?.combined?.resmgr?.extensions?.pf9_kube_status?.data || {}
              const lastFailedTask = currNodeKubeStatusData.last_failed_task || null
              const allTasks = currNodeKubeStatusData.all_tasks || []
              const completedTasks = currNodeKubeStatusData.completed_tasks || []
              const percentComplete = (completedTasks.length / allTasks.length) * 100
              const lastCompletedStep = allTasks[completedTasks.length - 1]
              const { color: progressColor, message: progressLabel } = getTaskContent(
                allTasks,
                completedTasks,
                lastFailedTask,
                lastCompletedStep,
                nodeState,
              )
              return (
                <Card
                  key={node.uuid}
                  className={clsx(classes.nodeCard, {
                    [classes.nodeCardSelected]: selectedNode && selectedNode.uuid === node.uuid,
                  })}
                  elevation={0}
                  onClick={() => setSelectedNode(node)}
                >
                  <article>
                    <Tooltip title={node.name}>
                      <Text variant="subtitle2" component="h3">
                        {node.name}
                      </Text>
                    </Tooltip>
                    <Text variant="body2" component="p">
                      ({node.primaryIp})
                    </Text>
                  </article>
                  <div>
                    <Text className={classes.nodeProgressLabel} variant="caption3" component="p">
                      {progressLabel}
                    </Text>
                    <ProgressBar
                      compact
                      width={'100%'}
                      percent={percentComplete}
                      color={progressColor}
                      label=""
                    />
                  </div>
                </Card>
              )
            })}
        </div>
        <Card elevation={0} className={classes.renderPane}>
          <header className={classes.paneHeader}>
            <div className={classes.paneHeaderTitle}>
              <Tooltip title={selectedNodeTitle || ''}>
                <Text variant="subtitle1">{selectedNodeTitle}</Text>
              </Tooltip>
              {!!selectedNode && selectedNodeStatus}
            </div>
            <div className={classes.paneHeaderStatus}>
              <div className={classes.resourceStats}>
                <ResourceStats usage={selectedNode?.combined?.usage} />
              </div>
              {!!selectedNode && (
                <ExternalLink url={selectedNode?.logs || ''} icon="clipboard-list">
                  <Text variant="body2" component="span">
                    View Logs
                  </Text>
                </ExternalLink>
              )}
            </div>
          </header>
          <article className={classes.paneBody}>
            {selectedNode && (
              <Tasks
                allTasks={selectedNodeAllTasks}
                lastFailedTask={lastSelectedNodesFailedTask}
                completedTasks={selectedNodeCompletedTasks}
                logs={selectedNode?.logs}
                nodeState={nodeState}
              />
            )}
          </article>
        </Card>
      </div>
    </>
  )
}
