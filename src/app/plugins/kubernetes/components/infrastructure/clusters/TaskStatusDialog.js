import React from 'react'
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import CloseIcon from '@material-ui/icons/Close'
import ExternalLink from 'core/components/ExternalLink'
import ClusterStatusSpan from 'k8s/components/infrastructure/clusters/ClusterStatusSpan'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { noop } from 'utils/fp'
import {
  clusterHealthStatusFields,
} from '../clusters/ClusterStatusUtils'

const useStyles = makeStyles(theme => ({
  closeIcon: {
    cursor: 'pointer',
    float: 'right',
  },
}))

const TaskStatusDialog = ({ isOpen, toggleOpen, node }) => {
  const classes = useStyles()

  if (!node) {
    return null
  }

  const { name, isMaster, logs, status } = node
  const { all_tasks: allTasks, last_failed_task: lastFailedTask } = node.combined.resmgr.extensions.pf9_kube_status.data
  const healthStatus = status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'

  return (
    <Dialog open={isOpen}>
      <DialogTitle>
        <CloseIcon className={classes.closeIcon} onClick={toggleOpen} />
      </DialogTitle>
      <DialogContent>
        <div>
          <span>{isMaster ? 'Master' : 'Worker'} Node:</span>
          {name}
          <ExternalLink url={logs}>Click here to see the logs for more info</ExternalLink>
        </div>
        Health Status:
        <HealthStatus healthStatus={healthStatus} />
        {healthStatusMessage[healthStatus]}
        <div>
          Here is a log of what got installed
          {healthStatus === 'unhealthy' && ' and where we ran into an error'}:
        </div>
        <Tasks allTasks={allTasks} lastFailedTask={lastFailedTask} />
      </DialogContent>
    </Dialog>
  )
}

const columns = [
  { id: 'task', label: 'Task', disableSorting: true },
  { id: 'status', label: 'Status' },
]

const TasksTable = createListTableComponent({
  columns,
  showCheckboxes: false,
  paginate: false,
  compactTable: true,
})

const Tasks =({ allTasks, lastFailedTask }) => {
  const failedTaskIndex = allTasks.indexOf(lastFailedTask)
  const getStatus = (index) => index === failedTaskIndex ? 'failed' : index <= failedTaskIndex ? 'completed' : 'none'
  const getTaskName = (value, index) => `${index + 1}. ${value}`
  const tasksWithStatus = allTasks.map((value, index) => ({
    task: getTaskName(value, index),
    status: getStatus(index),
  }))

  return (
    <div>
      <TasksTable data={tasksWithStatus} onSortChange={noop} />
      <div>{failedTaskIndex} out of {allTasks.length} tasks completed</div>
    </div>
  )
}

const HealthStatus = ({ healthStatus }) => {
  const fields = clusterHealthStatusFields[healthStatus]

  return (
    <ClusterStatusSpan title={fields.label} status={fields.status}>
      {fields.label}
    </ClusterStatusSpan>
  )
}

const healthStatusMessage = {
  healthy: 'No errors encountered while installing some components on this node',
  unhealthy: 'We encountered an error while installing some components on this node',
}

export default TaskStatusDialog
