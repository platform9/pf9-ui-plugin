import React, { FunctionComponent } from 'react'
import { makeStyles } from '@material-ui/styles'
import SyncIcon from '@material-ui/icons/Sync'
import { Theme } from '@material-ui/core'
import { SvgIconProps } from '@material-ui/core/SvgIcon'

const useStyles = makeStyles((theme: Theme) => ({
  flex: {
    display: 'flex',
    alignItems: 'center'
  },
  spacer: {
    width: theme.spacing()
  },
  rotate: {
    width: '22px',
    height: '22px',
    animation: '$spin 750ms infinite forwards'
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(360deg)',
    },
    '100%': {
      transform: 'rotate(0deg)',
    },
  }
}))

const iconColors = new Map<string, SvgIconProps['color']>([
  ['creating', 'action'],
  ['updating', 'primary'],
  ['deleting', 'disabled'],
  ['upgrading', 'primary'],
])

const ClusterSync: FunctionComponent<{ taskStatus: string }> = ({ children, taskStatus }) => {
  const { rotate, flex, spacer } = useStyles({})
  return <div className={flex}>
    <div className={rotate}>
      <SyncIcon color={iconColors.get(taskStatus)} />
    </div>
    <span className={spacer} />
    {children}
  </div>
}

export default ClusterSync
