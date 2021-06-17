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
import { clockDriftDetectedInNodes } from '../nodes/helper'

const getIconOrBubbleColor = (status: IClusterStatus, theme: Theme) =>
  ({
    ok: theme.palette.green.main,
    pause: theme.palette.yellow.main,
    fail: theme.palette.red.main,
    error: theme.palette.red.main,
    loading: theme.palette.blue.main,
    unknown: theme.palette.grey.main,
    upgrade: theme.palette.orange.main,
  }[status] || theme.palette.red.main)

const useStyles = makeStyles<Theme, Props>((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    borderRadius: '4px 0 0 4px',
    padding: theme.spacing(0.5, 0),
    backgroundColor: ({ status, inverseStatus }) =>
      inverseStatus ? getIconOrBubbleColor(status, theme) : 'inherit',
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
      display: ({ iconStatus, inverseStatus }) =>
        !inverseStatus && iconStatus === true ? 'none' : 'inherit',
      height: ({ variant, inverseStatus }) =>
        variant === 'header' ? 14 : inverseStatus ? 'auto' : 12,
      width: ({ variant, inverseStatus }) =>
        variant === 'header' ? 14 : inverseStatus ? 'auto' : 12,
      borderRadius: ({ inverseStatus }) => (inverseStatus ? '0' : '50%'),
      backgroundColor: ({ status }) => getIconOrBubbleColor(status, theme),
    },
  },
  iconColor: {
    fontSize: ({ variant }) => (variant === 'header' ? '1rem' : theme.typography.body1.fontSize),
    color: ({ status }) => getIconOrBubbleColor(status, theme),
    justifySelf: 'end',
  },
}))

type StatusVariant = 'table' | 'header'

const iconMap = new Map<IClusterStatus, { icon: string; classes: string }>([
  ['fail', { icon: 'times', classes: '' }],
  ['ok', { icon: 'check', classes: '' }],
  ['pause', { icon: 'pause-circle', classes: '' }],
  ['unknown', { icon: 'question-circle', classes: '' }],
  ['error', { icon: 'exclamation-triangle', classes: '' }],
  ['loading', { icon: 'sync', classes: 'fa-spin' }],
  ['upgrade', { icon: 'arrow-circle-up', classes: '' }],
])

interface Props {
  label?: string
  title: string | JSX.Element
  status?: IClusterStatus
  variant: StatusVariant
  iconStatus?: boolean
  className?: any
  inverseStatus?: boolean
  rootClassName?: any
}

const ClusterStatusSpan: FC<Props> = (props) => {
  const { label, title, children, status, iconStatus, className, rootClassName } = props
  const { circle, label: labelCls, root, iconColor } = useStyles(props)
  return (
    <div className={clsx(root, rootClassName)}>
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

export const renderErrorStatus = (nodesDetailsUrl, variant, text) => (
  <ClusterStatusSpan
    iconStatus
    title="Click the link to view more details"
    status="error"
    variant={variant}
  >
    <SimpleLink variant="error" src={nodesDetailsUrl}>
      {text}
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
  variant?: StatusVariant
  message?: string
  iconStatus?: boolean
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
      {(cluster.taskError || cluster.etcdBackup?.taskErrorDetail) &&
        renderErrorStatus(routes.cluster.detail.path({ id: cluster.uuid }), variant, 'Error')}
      {clockDriftDetectedInNodes(cluster.nodes) &&
        renderErrorStatus(
          routes.cluster.nodes.path({ id: cluster.uuid }),
          variant,
          'Node Clock Drift',
        )}
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
