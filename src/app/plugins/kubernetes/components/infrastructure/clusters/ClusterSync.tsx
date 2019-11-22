import React from 'react'
import Loading from 'core/components/Loading'
import SyncIcon from '@material-ui/icons/Sync'
import { SvgIconProps } from '@material-ui/core/SvgIcon'

const iconColors = new Map<string, SvgIconProps['color']>([
  ['creating', 'action'],
  ['updating', 'primary'],
  ['deleting', 'disabled'],
  ['upgrading', 'primary'],
])

const ClusterSync = ({ children, taskStatus }) => {
  return (
    <Loading icon={SyncIcon} reverse={true} color={iconColors.get(taskStatus)}>
      {children}
    </Loading>
  )
}

export default ClusterSync
