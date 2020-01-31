import { Tooltip, Typography } from '@material-ui/core'
import clsx from 'clsx'
import React, { FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import SimpleLink from 'core/components/SimpleLink'

import {
  isTransientStatus,
  getClusterHealthStatus,
  getClusterConnectionStatus,
} from './ClusterStatusUtils'
import { ICluster } from './model'
import ProgressBar from 'core/components/progress/ProgressBar'
import ClusterSync from './ClusterSync'
import { capitalizeString } from 'utils/misc'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme, Props>((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    padding: theme.spacing(0.5, 0),
  },
  label: {
    width: 50,
  },
  circle: {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    '&:before': {
      content: '\' \'',
      height: ({ variant }) => variant === 'header' ? theme.typography.body1.fontSize : theme.typography.body2.fontSize,
      width: ({ variant }) => variant === 'header' ? theme.typography.body1.fontSize : theme.typography.body2.fontSize,
      marginRight: 5,
      borderRadius: '50%',
      // display: ({ status }) => !status || ['loading', 'error'].includes(status) ? 'none' : 'inline-block',
      backgroundColor: ({ status }) => ({
        ok: theme.palette.pieChart.success,
        pause: theme.palette.pieChart.warning,
        fail: theme.palette.pieChart.error,
        unknown: theme.palette.primary.main,
      }[status] || theme.palette.pieChart.error)
    },
  },
  loading: {
    marginRight: theme.spacing(0.375),
    fontSize: ({ variant }) => variant === 'header' ? theme.typography.body1.fontSize : theme.typography.body2.fontSize,
  },
  error: {
    marginRight: theme.spacing(0.375),
    fontSize: ({ variant }) => variant === 'header' ? theme.typography.body1.fontSize : theme.typography.body2.fontSize,
  },
}))

type StatusVariant = 'table' | 'header'

interface Props {
  label?: string
  title: string
  status?: string
  variant: StatusVariant
}
const ClusterStatusSpan: FC<Props> = props => {
  const { label, title, children, status, variant } = props
  const { loading, error, circle, label: labelCls, root } = useStyles(props)
  return <div className={root}>
    {label && <span className={labelCls}>{label}:</span>}
    <Tooltip title={title || children}>
      <Typography className={circle} variant={variant === 'header' ? 'body1' : 'body2'}>
        {status === 'loading' && <i className={clsx(loading, 'fal fa-lg fa-spin fa-sync')} />}
        {status === 'error' && <i className={clsx(error, 'fas fa-exclamation-triangle')} />}
        {children}
      </Typography>
    </Tooltip>
  </div>
}

export default ClusterStatusSpan

const renderErrorStatus = (taskError, nodesDetailsUrl, variant) => (
  <ClusterStatusSpan
    title={taskError}
    status='error'
    variant={variant}
  >
    <SimpleLink variant="error" src={nodesDetailsUrl}>Error</SimpleLink>
  </ClusterStatusSpan>
)

const renderTransientStatus = (connectionStatus, progressPercent, variant) => {
  const spanContent = `The cluster is ${connectionStatus}.`

  return (
    <div>
      {progressPercent &&
        <ProgressBar height={20} animated containedPercent percent={progressPercent
          ? (+progressPercent).toFixed(0)
          : 0}
        />
      }
      <ClusterSync taskStatus={connectionStatus}>
        <ClusterStatusSpan title={spanContent} variant={variant}>
          {capitalizeString(connectionStatus)}
        </ClusterStatusSpan>
      </ClusterSync>
    </div>
  )
}

interface IClusterStatusProps { cluster: ICluster, variant: StatusVariant, message?: string }
export const ClusterHealthStatus: FC<IClusterStatusProps> = ({ cluster, variant = 'table', message = undefined }) => {
  if (isTransientStatus(cluster.healthStatus)) {
    return renderTransientStatus(cluster.healthStatus, cluster.progressPercent, variant)
  }

  const fields = getClusterHealthStatus(cluster)

  if (!fields) {
    return (
      <ClusterStatusSpan
        title={message || 'unknown'}
        status="unknown"
        variant={variant}
      >
        { message || 'unknown' }
      </ClusterStatusSpan>
    )
  }

  return (
    <div>
      <ClusterStatusSpan
        title={fields.message}
        status={fields.status}
        variant={variant}
      >
        { variant === 'header' ? fields.label : <SimpleLink src={fields.nodesDetailsUrl}>{fields.label}</SimpleLink> }
      </ClusterStatusSpan>
      {cluster.taskError && renderErrorStatus(cluster.taskError, fields.nodesDetailsUrl, variant)}
    </div>
  )
}

export const ClusterConnectionStatus: FC<IClusterStatusProps> = ({ cluster, variant = 'table', message = undefined }) => {
  if (isTransientStatus(cluster.connectionStatus)) {
    return renderTransientStatus(cluster.connectionStatus, cluster.progressPercent, variant)
  }
  const fields = getClusterConnectionStatus(cluster)

  if (!fields) {
    return (
      <ClusterStatusSpan
        title={message || 'unknown'}
        status="unknown"
        variant={variant}
      >
        { message || 'unknown' }
      </ClusterStatusSpan>
    )
  }

  return (
    <ClusterStatusSpan
      title={fields.message}
      status={fields.clusterStatus}
      variant={variant}>
      { variant === 'header' ? fields.label : <SimpleLink src={fields.nodesDetailsUrl}>{fields.label}</SimpleLink> }
    </ClusterStatusSpan>
  )
}
