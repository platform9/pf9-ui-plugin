import React from 'react'
import { Grid, Dialog, DialogTitle, DialogContent } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { makeStyles } from '@material-ui/styles'
import ClusterStatusSpan from 'k8s/components/infrastructure/clusters/ClusterStatusSpan'
import useToggler from 'core/hooks/useToggler'
import ResourceUsageTable from 'k8s/components/infrastructure/common/ResourceUsageTable'
import {
  connectionStatusFieldsTable,
  clusterHealthStatusFields,
} from './ClusterStatusUtils'

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  title: {
    fontSize: 16,
  },
  shiftRight: {
    marginLeft: theme.spacing(3)
  },
  statusLabel: {
    fontSize: 14,
  },
  message: {
    fontSize: 12,
    marginLeft: theme.spacing(1)
  },
  error: {
    cursor: 'pointer',
    marginTop: theme.spacing(2),
    '&:hover': {
      textDecoration: 'underline',
    }
  },
  resources: {
    marginTop: theme.spacing(2),
  },
  closeIcon: {
    cursor: 'pointer',
    float: 'right',
  },
}))

const clusterConnectionMessages = {
  connected: 'All nodes in the cluster are conected',
  disconnected: 'All nodes in the cluster are disconected',
  partially_connected: 'Some nodes in the cluster are not connected',
}

const masterNodesHealthMessages = {
  healthy: 'All masters are healthy',
  partially_healthy: 'Quorum number of masters are healthy',
  unhealthy: 'Less than quorum number of masters are healthy',
  unknown: 'Unknown',
}

const workerNodesHealthMessages = {
  healthy: 'All workers are healthy',
  partially_healthy: 'Majority of workers (> 50%) are healthy',
  unhealthy: 'Majority of workers (> 50%) are unhealthy',
  unknown: 'Unknown',
}

const ClusterNodesOverview = ({ cluster }) => {
  const classes = useStyles()
  const [isDialogOpen, toggleDialog] = useToggler()

  if (!cluster) {
    return null
  }

  const connectionFields = connectionStatusFieldsTable[cluster.connectionStatus]
  const masterNodesFields = clusterHealthStatusFields[cluster.masterNodesHealthStatus]
  const workerNodesFields = clusterHealthStatusFields[cluster.workerNodesHealthStatus]
  const clusterConnectionMessage = clusterConnectionMessages[cluster.connectionStatus]
  const masterNodesMessage = masterNodesHealthMessages[cluster.masterNodesHealthStatus]
  const workerNodesMessage = workerNodesHealthMessages[cluster.workerNodesHealthStatus]

  return (
    <Grid container spacing={4} className={classes.container}>
      <Grid item xs={6}>
        <Status
          classes={classes}
          title='Cluster Connection Status:'
          status={connectionFields.clusterStatus}
          statusLabel={connectionFields.label}
          message={clusterConnectionMessage}
        />
        <Status
          classes={classes}
          title='Master Nodes Health Status:'
          status={masterNodesFields.status}
          statusLabel={masterNodesFields.label}
          message={masterNodesMessage}
        />
        <Status
          classes={classes}
          title='Worker Nodes Health Status:'
          status={workerNodesFields.status}
          statusLabel={workerNodesFields.label}
          message={workerNodesMessage}
        />
        {!!cluster.taskError && <Error classes={classes} onClick={toggleDialog} />}
        <Dialog open={isDialogOpen}>
          <DialogTitle>
            <CloseIcon className={classes.closeIcon} onClick={toggleDialog} />
          </DialogTitle>
          <DialogContent>
            {cluster.taskError}
          </DialogContent>
        </Dialog>
      </Grid>
      <Grid container item xs={6}>
        <ResourceUtilization classes={classes} usage={cluster.usage} />
      </Grid>
    </Grid>
  )
}

const Status = ({ classes, status, statusLabel, title, message }) =>
  <div>
    <div className={classes.title}>{title}</div>
    <div className={classes.shiftRight}>
      <ClusterStatusSpan status={status}>
        <span className={classes.statusLabel}>{statusLabel}</span>
        <span className={classes.message}>{message}</span>
      </ClusterStatusSpan>
    </div>
  </div>

const Error = ({ classes, onClick }) =>
  <div className={classes.error}>
    <ClusterStatusSpan status='error'>
      <span onClick={onClick} className={classes.title}>The last cluster operation failed (see error)</span>
    </ClusterStatusSpan>
  </div>

const toMHz = value => value * 1024

const ResourceUtilization = ({ classes, usage }) => {
  if (!usage) {
    return null
  }

  const { compute, memory, disk } = usage
  return (
    <div>
      <div className={classes.title}>Cluster Resource Utilization:</div>
      <div className={classes.resources}>
        <ResourceUsageTable valueConverter={toMHz} units="MHz" label="CPU" stats={compute} />
        <ResourceUsageTable units="GiB" label="Memory" stats={memory} />
        <ResourceUsageTable units="GiB" label="Storage" stats={disk} />
      </div>
    </div>
  )
}

export default ClusterNodesOverview
