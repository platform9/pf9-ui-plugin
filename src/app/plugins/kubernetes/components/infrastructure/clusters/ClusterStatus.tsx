import { Tooltip, Typography } from '@material-ui/core'
import React, { FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'
import SimpleLink from 'core/components/SimpleLink'

import {
  isTransientStatus,
  getClusterHealthStatus,
  getClusterConnectionStatus,
  IClusterStatus,
} from './ClusterStatusUtils'
import { ICluster } from './model'
import ProgressBar from 'core/components/progress/ProgressBar'
import { capitalizeString } from 'utils/misc'
import Theme from 'core/themes/model'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import clsx from 'clsx'

const getIconOrBubbleColor = (status: IClusterStatus, theme: Theme) =>
  ({
    ok: theme.palette.pieChart.success,
    pause: theme.palette.pieChart.warning,
    fail: theme.palette.pieChart.error,
    error: theme.palette.pieChart.error,
    loading: theme.palette.primary.main,
    unknown: theme.palette.primary.main,
  }[status] || theme.palette.pieChart.error)

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
    display: 'grid',
    alignItems: 'center',
    gridTemplateColumns: '20px 1fr',
    gridGap: theme.spacing(),
    justifyItems: 'center',
    '&:before': {
      content: '""',
      display: ({ iconStatus }) => (iconStatus === true ? 'none' : 'inherit'),
      height: ({ variant }) =>
        variant === 'header' ? theme.typography.body1.fontSize : theme.typography.body2.fontSize,
      width: ({ variant }) =>
        variant === 'header' ? theme.typography.body1.fontSize : theme.typography.body2.fontSize,
      borderRadius: '50%',
      backgroundColor: ({ status }) => getIconOrBubbleColor(status, theme)
    },
  },
  iconColor: {
    fontSize: ({ variant }) => (variant === 'header' ? theme.typography.subtitle1.fontSize : 16),
    color: ({ status }) => getIconOrBubbleColor(status, theme)
  },
}))

type StatusVariant = 'table' | 'header'

const iconMap = new Map([
  ['fail', { icon: 'times', classes: '' }],
  ['ok', { icon: 'check', classes: '' }],
  ['pause', { icon: 'pause-circle', classes: '' }],
  ['unknown', { icon: 'question-circle', classes: '' }],
  ['error', { icon: 'exclamation-triangle', classes: '' }],
  ['loading', { icon: 'sync', classes: 'fa-spin' }],
])

interface Props {
  label?: string
  title: string
  status?: IClusterStatus
  variant: StatusVariant
  iconStatus?: boolean
}
const ClusterStatusSpan: FC<Props> = (props) => {
  const { label, title, children, status, variant, iconStatus } = props
  const { circle, label: labelCls, root, iconColor } = useStyles(props)
  return (
    <div className={root}>
      {label && <span className={labelCls}>{label}:</span>}
      <Tooltip title={title || children}>
        <Typography className={circle} variant={variant === 'header' ? 'body1' : 'body2'}>
          {!!iconStatus && (
            <FontAwesomeIcon className={clsx(iconColor, iconMap.get(status).classes)}>
              {iconMap.get(status).icon}
            </FontAwesomeIcon>
          )}
          {children}
        </Typography>
      </Tooltip>
    </div>
  )
}

ClusterStatusSpan.propTypes = {
  label: PropTypes.string,
  title: PropTypes.string,
  status: PropTypes.oneOf(['ok', 'fail', 'pause', 'loading', 'error', 'unknown']),
}

export default ClusterStatusSpan

const renderErrorStatus = (taskError, nodesDetailsUrl, variant) => (
  <ClusterStatusSpan title={taskError} status="error" iconStatus variant={variant}>
    <SimpleLink src={nodesDetailsUrl}>Error</SimpleLink>
  </ClusterStatusSpan>
)

const renderTransientStatus = (connectionStatus, progressPercent, variant) => {
  const spanContent = `The cluster is ${connectionStatus}.`

  return (
    <div>
      {progressPercent && (
        <ProgressBar
          height={20}
          animated
          containedPercent
          percent={progressPercent ? (+progressPercent).toFixed(0) : 0}
        />
      )}
      <ClusterStatusSpan title={spanContent} variant={variant} status="loading" iconStatus>
        {capitalizeString(connectionStatus)}
      </ClusterStatusSpan>
    </div>
  )
}

interface IClusterStatusProps {
  cluster: ICluster
  variant: StatusVariant
  message?: string
}
export const ClusterHealthStatus: FC<IClusterStatusProps> = ({
  cluster,
  variant = 'table',
  message = undefined,
}) => {
  if (isTransientStatus(cluster.healthStatus)) {
    return renderTransientStatus(cluster.healthStatus, cluster.progressPercent, variant)
  }

  const fields = getClusterHealthStatus(cluster)

  if (!fields) {
    return (
      <ClusterStatusSpan title={message || 'unknown'} status="unknown" variant={variant}>
        {message || 'unknown'}
      </ClusterStatusSpan>
    )
  }

  return (
    <div>
      <ClusterStatusSpan title={fields.message} status={fields.status} variant={variant}>
        {variant === 'header' ? (
          fields.label
        ) : (
          <SimpleLink src={fields.nodesDetailsUrl}>{fields.label}</SimpleLink>
        )}
      </ClusterStatusSpan>
      {cluster.taskError && renderErrorStatus(cluster.taskError, fields.nodesDetailsUrl, variant)}
    </div>
  )
}

export const ClusterConnectionStatus: FC<IClusterStatusProps> = ({
  cluster,
  variant = 'table',
  message = undefined,
}) => {
  if (isTransientStatus(cluster.connectionStatus)) {
    return renderTransientStatus(cluster.connectionStatus, cluster.progressPercent, variant)
  }
  const fields = getClusterConnectionStatus(cluster)

  if (!fields) {
    return (
      <ClusterStatusSpan title={message || 'unknown'} status="unknown" variant={variant}>
        {message || 'unknown'}
      </ClusterStatusSpan>
    )
  }

  return (
    <ClusterStatusSpan title={fields.message} status={fields.clusterStatus} variant={variant}>
      {variant === 'header' ? (
        fields.label
      ) : (
        <SimpleLink src={fields.nodesDetailsUrl}>{fields.label}</SimpleLink>
      )}
    </ClusterStatusSpan>
  )
}
