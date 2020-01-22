import { Tooltip, Typography } from '@material-ui/core'
import clsx from 'clsx'
import React, { FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'
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

const useStyles = makeStyles<Theme, Props>(theme => ({
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
    flexDirection: ({ variant }) => variant === 'header' ? 'column-reverse' : 'row',
    alignItems: 'center',
    '&:before': {
      content: '\' \'',
      height: ({ variant }) => variant === 'header' ? 30 : 14,
      width: ({ variant }) => variant === 'header' ? 30 : 14,
      marginTop: ({ variant }) => variant === 'header' ? theme.spacing() : 0,
      marginRight: 3,
      borderRadius: '50%',
      // display: ({ status }) => !status || ['loading', 'error'].includes(status) ? 'none' : 'inline-block',
      backgroundColor: ({ status }) => ({
        ok: '#31DA6D',
        pause: '#fec35d',
        fail: '#F16E3F',
      }[status] || '#F16E3F')
    },
  },
  loading: {
    marginRight: theme.spacing(0.375),
    fontSize: ({ variant }) => variant === 'header' ? 20 : 14,
  },
  error: {
    marginRight: theme.spacing(0.375),
    fontSize: ({ variant }) => variant === 'header' ? 20 : 14,
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
      <Typography className={circle} variant={variant === 'header' ? 'h5' : 'body2'}>
        {status === 'loading' && <i className={clsx(loading, 'fal fa-lg fa-spin fa-sync')} />}
        {status === 'error' && <i className={clsx(error, 'fas fa-exclamation-triangle')} />}
        {children}
      </Typography>
    </Tooltip>
  </div>
}

ClusterStatusSpan.propTypes = {
  label: PropTypes.string,
  title: PropTypes.string,
  status: PropTypes.oneOf(['ok', 'fail', 'pause', 'loading', 'error'])
}

export default ClusterStatusSpan

const renderErrorStatus = (taskError, nodesDetailsUrl, variant) => (
  <ClusterStatusSpan
    title={taskError}
    status='error'
    variant={variant}
  >
    <SimpleLink src={nodesDetailsUrl}>Error</SimpleLink>
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

interface IClusterStatusProps {cluster: ICluster, variant: StatusVariant}
export const ClusterHealthStatus: FC<IClusterStatusProps> = ({cluster, variant = 'table'}) => {
  if (isTransientStatus(cluster.healthStatus)) {
    return renderTransientStatus(cluster.healthStatus, cluster.progressPercent, variant)
  }

  const fields = getClusterHealthStatus(cluster)

  if (!fields) {
    return <span>N/A</span>
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

export const ClusterConnectionStatus: FC<IClusterStatusProps> = ({cluster, variant = 'table'}) => {
  if (isTransientStatus(cluster.connectionStatus)) {
    return renderTransientStatus(cluster.connectionStatus, cluster.progressPercent, variant)
  }
  const fields = getClusterConnectionStatus(cluster)

  if (!fields) {
    return <span>N/A</span>
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