import React from 'react'
import { Grid, Dialog, DialogTitle, DialogContent } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { makeStyles } from '@material-ui/styles'
import ClusterStatusSpan from 'k8s/components/infrastructure/clusters/ClusterStatusSpan'
import ProgressBar from 'core/components/progress/ProgressBar'
import useToggler from 'core/hooks/useToggler'

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
  resourceContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  resourceLabel: {
    fontWeight: 500,
    marginRight: theme.spacing(0.25)
  },
  progressBar: {
    marginLeft: theme.spacing(2)
  },
  closeIcon: {
    cursor: 'pointer',
    float: 'right',
  },
}))

const ClusterNodesOverview = ({ cluster = {} }) => {
  const classes = useStyles()
  const [isDialogOpen, toggleDialog] = useToggler()

  if (!cluster) {
    return null
  }

  return (
    <Grid container spacing={4} className={classes.container}>
      <Grid item xs={6}>
        <Status
          classes={classes}
          title='Cluster Connection Status:'
          status='ok'
          statusLabel='Connected'
          message='All nodes of the cluster are connected'
        />
        <Status
          classes={classes}
          title='Master Nodes Health Status:'
          status='ok'
          statusLabel='Connected'
          message='Healthy All master nodes are healthy'
        />
        <Status
          classes={classes}
          title='Worker Nodes Health Status:'
          status='ok'
          statusLabel='Connected'
          message='Healthy > 50% of worker nodes are healthy'
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
        <ResourceUtilization classes={classes} />
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

const ResourceUtilization = ({ classes }) => {
  return (
    <div>
      <div className={classes.title}>Cluster Resource Utilization:</div>
      <Resource
        classes={classes}
        label='CPU:'
        value='25'
        unit='GHz'
        percentage={0.5}
      />
      <Resource
        classes={classes}
        label='Memory:'
        value='25'
        unit='GHz'
        percentage={0.5}
      />
      <Resource
        classes={classes}
        label='Storage:'
        value='25'
        unit='GHz'
        percentage={0.5}
      />
    </div>
  )
}

const Resource = ({ classes, label, value, unit, percentage }) =>
  <div className={classes.resourceContainer}>
    <span>
      <span className={classes.resourceLabel}>{label}</span>
      {` ${value} ${unit}`}
    </span>
    <span className={classes.progressBar}><ProgressBar percent={percentage * 100} /></span>
  </div>

export default ClusterNodesOverview
