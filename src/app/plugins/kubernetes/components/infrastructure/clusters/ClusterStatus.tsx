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
    ok: theme.components.success.main,
    pause: theme.components.warning.main,
    fail: theme.components.error.main,
    error: theme.components.error.main,
    loading: theme.components.sidebar.text,
    unknown: theme.palette.info.main,
    upgrade: theme.components.upgrade.main,
  }[status] || theme.components.error.main)

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
}

const ClusterStatusSpan: FC<Props> = (props) => {
  const { label, title, children, status, variant, iconStatus } = props
  const { circle, label: labelCls, root, iconColor } = useStyles(props)
  return (
    <div className={root}>
      {label && <span className={labelCls}>{label}:</span>}
      <Tooltip title={title || children}>
        <Text className={circle} variant={variant === 'header' ? 'body1' : 'body2'}>
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
}) => {
  if (isTransientStatus(cluster.taskStatus)) {
    return renderTransientStatus(cluster, variant)
  }

  const fields = getClusterHealthStatus(cluster)

  if (cluster.connectionStatus === 'disconnected') {
    return (
      <div>
        <ClusterStatusSpan title={message || 'Unknown'} status="unknown" variant={variant}>
          {message || 'Unknown'}
        </ClusterStatusSpan>
        {cluster.taskError && renderErrorStatus(cluster.taskError, fields.nodesDetailsUrl, variant)}
      </div>
    )
  }

  return (
    <div>
      {fields && (
        <ClusterStatusSpan title={fields.message} status={fields.status} variant={variant}>
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
}) => {
  if (isTransientStatus(cluster.taskStatus)) {
    return renderTransientStatus(cluster, variant)
  }
  const fields = getClusterConnectionStatus(cluster)

  if (!fields) {
    return (
      <ClusterStatusSpan title={message || 'Unknown'} status="unknown" variant={variant}>
        {message || 'Unknown'}
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
