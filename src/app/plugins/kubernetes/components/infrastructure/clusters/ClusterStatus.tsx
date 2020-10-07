import { Tooltip } from '@material-ui/core'
import Text from 'core/elements/text'
import React, { FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import SimpleLink from 'core/components/SimpleLink'

import {
  isTransientStatus,
  getClusterHealthStatus,
  getClusterConnectionStatus,
} from './ClusterStatusUtils'
import { IClusterSelector, IClusterStatus } from './model'
import { capitalizeString } from 'utils/misc'
import Theme from 'core/themes/model'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import clsx from 'clsx'
import { routes } from 'core/utils/routes'

const getIconOrBubbleColor = (status: IClusterStatus, theme: Theme) =>
  ({
    ok: theme.palette.green.main,
    pause: theme.palette.yellow.main,
    fail: theme.palette.red.main,
    error: theme.palette.red.main,
    loading: theme.palette.grey.main,
    unknown: theme.palette.blue.main,
    upgrade: theme.palette.orange.main,
  }[status] || theme.palette.red.main)

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
    gridTemplateColumns: '12px 1fr',
    whiteSpace: 'nowrap',
    gridGap: 5,
    justifyItems: 'center',
    '&:before': {
      content: '""',
      display: ({ iconStatus }) => (iconStatus === true ? 'none' : 'inherit'),
      height: ({ variant }) => (variant === 'header' ? 14 : 12),
      width: ({ variant }) => (variant === 'header' ? 14 : 12),
      borderRadius: '50%',
      backgroundColor: ({ status }) => getIconOrBubbleColor(status, theme),
    },
  },
  iconColor: {
    fontSize: ({ variant }) => (variant === 'header' ? '1rem' : theme.typography.body1.fontSize),
    color: ({ status }) => getIconOrBubbleColor(status, theme),
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
  title: string | JSX.Element
  status?: IClusterStatus
  variant: StatusVariant
  iconStatus?: boolean
  className?: any
}

const ClusterStatusSpan: FC<Props> = (props) => {
  const { label, title, children, status, iconStatus, className } = props
  const { circle, label: labelCls, root, iconColor } = useStyles(props)
  return (
    <div className={root}>
      {label && <span className={labelCls}>{label}:</span>}
      <Tooltip title={title || children}>
        <Text className={clsx(circle, className)} variant={'body2'}>
          {!!iconStatus && (
            <FontAwesomeIcon className={clsx(iconColor, iconMap.get(status).classes)}>
              {iconMap.get(status).icon}
            </FontAwesomeIcon>
          )}
          {children}
        </Text>
      </Tooltip>
    </div>
  )
}

export default ClusterStatusSpan

const renderErrorStatus = (taskError, nodesDetailsUrl, variant) => (
  <ClusterStatusSpan iconStatus title={taskError} status="error" variant={variant}>
    <SimpleLink variant="error" src={nodesDetailsUrl}>
      Error
    </SimpleLink>
  </ClusterStatusSpan>
)

const renderTransientStatus = ({ uuid, connectionStatus }, variant) => {
  if (!connectionStatus) {
    return null
  }
  const spanContent = `The cluster is ${connectionStatus}.`

  return (
    <ClusterStatusSpan title={spanContent} variant={variant} status="loading" iconStatus>
      <SimpleLink src={routes.cluster.nodeHealth.path({ id: uuid })}>
        {capitalizeString(connectionStatus)}
      </SimpleLink>
    </ClusterStatusSpan>
  )
}

interface IClusterStatusProps {
  cluster: IClusterSelector
  variant: StatusVariant
  message?: string
}

export const ClusterHealthStatus: FC<IClusterStatusProps> = ({
  cluster,
  variant = 'table',
  message = undefined,
  ...rest
}) => {
  if (isTransientStatus(cluster.taskStatus)) {
    return renderTransientStatus(cluster, variant)
  }

  const fields = getClusterHealthStatus(cluster)

  if (cluster.connectionStatus === 'disconnected') {
    return (
      <div>
        <ClusterStatusSpan
          title={message || 'Unknown'}
          status="unknown"
          variant={variant}
          {...rest}
        >
          {message || 'Unknown'}
        </ClusterStatusSpan>
        {cluster.taskError && renderErrorStatus(cluster.taskError, fields.nodesDetailsUrl, variant)}
      </div>
    )
  }

  return (
    <div>
      {fields && (
        <ClusterStatusSpan
          title={fields.message}
          status={fields.status}
          variant={variant}
          {...rest}
        >
          {variant === 'header' ? (
            fields.label
          ) : (
            <SimpleLink src={fields.nodesDetailsUrl}>{fields.label}</SimpleLink>
          )}
        </ClusterStatusSpan>
      )}
      {cluster.taskError && renderErrorStatus(cluster.taskError, fields.nodesDetailsUrl, variant)}
    </div>
  )
}

export const ClusterConnectionStatus: FC<IClusterStatusProps> = ({
  cluster,
  variant = 'table',
  message = undefined,
  ...rest
}) => {
  if (isTransientStatus(cluster.taskStatus)) {
    return renderTransientStatus(cluster, variant)
  }
  const fields = getClusterConnectionStatus(cluster)

  if (!fields) {
    return (
      <ClusterStatusSpan title={message || 'Unknown'} status="unknown" variant={variant} {...rest}>
        {message || 'Unknown'}
      </ClusterStatusSpan>
    )
  }

  return (
    <ClusterStatusSpan
      title={fields.message}
      status={fields.clusterStatus}
      variant={variant}
      {...rest}
    >
      {variant === 'header' ? (
        fields.label
      ) : (
        <SimpleLink src={fields.nodesDetailsUrl}>{fields.label}</SimpleLink>
      )}
    </ClusterStatusSpan>
  )
}
