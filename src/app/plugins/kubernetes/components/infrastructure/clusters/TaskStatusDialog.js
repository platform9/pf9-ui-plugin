import React from 'react'
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import CloseIcon from '@material-ui/icons/Close'
import clsx from 'clsx'
import ExternalLink from 'core/components/ExternalLink'
import ClusterStatusSpan from 'k8s/components/infrastructure/clusters/ClusterStatus'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { noop, pathStrOr } from 'utils/fp'
import { clusterHealthStatusFields, isTransientStatus } from '../clusters/ClusterStatusUtils'
import { capitalizeString } from 'utils/misc'

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: theme.spacing(75),
  },
  closeIcon: {
    cursor: 'pointer',
    float: 'right',
  },
  bold: {
    fontWeight: 500,
  },
  marginLeft: {
    marginLeft: theme.spacing(1),
  },
  titleContainer: {
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: 16,
  },
  externalLink: {
    maxWidth: theme.spacing(20),
    marginLeft: 'auto',
  },
  healthStatusTitle: {
    fontSize: 14,
    marginBottom: theme.spacing(1),
  },
  healthStatusContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
  },
  tasksCompleted: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  message: {
    fontSize: 12,
  },
  statusRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(75px, min-content) 1fr',
    alignItems: 'center',
  },
  linkSpacer: {
    paddingLeft: theme.spacing(),
  },
}))

const TaskStatusDialog = ({ isOpen, toggleOpen, node }) => {
  const classes = useStyles()

  if (!node) {
    return null
  }

  const { name, isMaster, logs, status } = node
  const {
    all_tasks: allTasks = [],
    last_failed_task: lastFailedTask,
    completed_tasks: completedTasks,
    pf9_kube_node_state: nodeState,
  } = pathStrOr({}, 'combined.resmgr.extensions.pf9_kube_status.data', node)
  const healthStatus =
    status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'

  return (
    <Dialog classes={{ paperWidthSm: classes.root }} open={isOpen}>
      <DialogTitle>
        <CloseIcon className={classes.closeIcon} onClick={toggleOpen} />
      </DialogTitle>
      <DialogContent>
        <div className={classes.titleContainer}>
          <span className={clsx(classes.title, classes.bold)}>
            {isMaster ? 'Master' : 'Worker'} Node:
          </span>
          <span className={clsx(classes.title, classes.marginLeft)}>{name}</span>
          <span className={classes.externalLink}>
            <ExternalLink url={logs}>Click here to see the logs for more info</ExternalLink>
          </span>
        </div>
        <div className={classes.healthStatusTitle}>Health Status:</div>
        <div className={classes.healthStatusContainer}>
          <HealthStatus healthStatus={healthStatus} />
          <span className={classes.message}>{healthStatusMessage[healthStatus]}</span>
        </div>
        <span className={classes.message}>
          Here is a log of what got installed
          {healthStatus === 'unhealthy' && ' and where we ran into an error'}:
        </span>
        <Tasks
          allTasks={allTasks}
          lastFailedTask={lastFailedTask}
          completedTasks={completedTasks}
          logs={node.logs}
          nodeState={nodeState}
        />
      </DialogContent>
    </Dialog>
  )
}

const statusMap = new Map([
  ['fail', 'Failed'],
  ['ok', 'Completed'],
  ['loading', 'In Progress'],
  ['retrying', 'Failed... Retrying'],
  ['failed', 'Failed'],
  ['disconnected', 'Unknown'],
])

const renderStatus = (_, { status, logs }) => <RenderNodeStatus status={status} logs={logs} />

const RenderNodeStatus = ({ status, logs }) => {
  // TODO fix this stupid styling dependency so I dont
  // have to make a component anytime i want styles.
  const classes = useStyles()
  return (
    <NodeTaskStatus status={status} iconStatus>
      {(status.includes('fail') || status === 'retrying') && (
        <ExternalLink className={classes.linkSpacer} url={logs || ''}>
          View Logs
        </ExternalLink>
      )}
    </NodeTaskStatus>
  )
}

export const NodeTaskStatus = ({ status, iconStatus = false, children }) => {
  const classes = useStyles()
  if (status === 'none') {
    return <EmptyStatus />
  }
  const statusInTransientState = isTransientStatus(status) || status === 'retrying'
  const renderValue = statusMap.get(status) || capitalizeString(status)
  const renderStatus = statusInTransientState ? 'loading' : status
  const showIconStatusAlways = statusInTransientState ? true : iconStatus

  return (
    <div className={classes.statusRow}>
      <ClusterStatusSpan
        iconStatus={showIconStatusAlways}
        status={renderStatus}
        title={renderValue}
      >
        {renderValue}
      </ClusterStatusSpan>
      {children}
    </div>
  )
}

const columns = [
  { id: 'task', label: 'Task', disableSorting: true },
  { id: 'status', label: 'Status', render: renderStatus },
]

const TasksTable = createListTableComponent({
  columns,
  uniqueIdentifier: 'task',
  showCheckboxes: false,
  paginate: false,
  compactTable: true,
  emptyText: <Text variant="body1">No status information currently available.</Text>,
})

export const Tasks = ({ allTasks, completedTasks = [], lastFailedTask, logs, nodeState }) => {
  const classes = useStyles()
  const failedTaskIndex = allTasks.indexOf(lastFailedTask)
  const completedTaskCount = failedTaskIndex >= 0 ? failedTaskIndex : completedTasks.length
  const getStatus = (index) => {
    if (index === failedTaskIndex && nodeState !== 'retrying') {
      return 'fail'
    }
    if (index === failedTaskIndex && nodeState === 'retrying') {
      return 'retrying'
    }
    if (index < completedTasks.length || index <= failedTaskIndex) {
      return 'ok'
    }
    if (index === completedTasks.length && completedTasks.length > 0 && failedTaskIndex === -1) {
      return 'loading'
    }
    return 'none'
  }
  const getTaskName = (value, index) => `${index + 1}. ${value}`
  const tasksWithStatus = allTasks.map((value, index) => ({
    task: getTaskName(value, index),
    status: getStatus(index),
    logs,
  }))

  return (
    <div>
      <TasksTable data={tasksWithStatus} onSortChange={noop} />
      <div className={classes.tasksCompleted}>
        {completedTaskCount} out of {allTasks.length} tasks completed
      </div>
    </div>
  )
}

const HealthStatus = ({ healthStatus }) => {
  const fields = clusterHealthStatusFields[healthStatus]

  return (
    <ClusterStatusSpan iconStatus title={fields.label} status={fields.status}>
      {fields.label}
    </ClusterStatusSpan>
  )
}

const EmptyStatus = () => (
  <span style={{ visibility: 'hidden' }}>
    <ClusterStatusSpan iconStatus status="pause" title="pause" />
  </span>
)

const healthStatusMessage = {
  healthy: 'No errors encountered while installing some components on this node',
  unhealthy: 'We encountered an error while installing some components on this node',
}

export default TaskStatusDialog
