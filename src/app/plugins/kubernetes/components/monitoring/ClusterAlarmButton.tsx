import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Text from 'core/elements/text'
import { pathStr } from 'utils/fp'

interface StyleProps {
  type?: string
  active?: boolean
  count?: number
}

const useStyles = makeStyles<Theme, Partial<StyleProps>>((theme: Theme) => ({
  alarmButton: {
    width: 180,
    height: 40,
    display: 'inline-flex',
    alignItems: 'center',
    border: ({ active, type }) => {
      if (active) {
        if (type === 'fatal') {
          return `1px solid #f9dcd8`
        } else if (type === 'critical') {
          return `1px solid #fde3d0`
        } else if (type === 'warning') {
          return `1px solid #fdf5d1`
        }
      }
      return 'none'
    },
    cursor: ({ count }) => (count ? 'pointer' : ''),
    color: ({ count }) => (count ? '' : theme.palette.grey[300]),
    background: ({ type, active, count }) => {
      // No good matches in palette, use hex values to match zeplin
      if (active) {
        return 'none'
      }
      if (!count) {
        return theme.palette.grey[200]
      }
      if (type === 'fatal') {
        return '#f9dcd8'
      } else if (type === 'critical') {
        return '#fde3d0'
      } else if (type === 'warning') {
        return '#fdf5d1'
      } else {
        return ''
      }
    },
  },
  alarmButtonType: {
    flexGrow: 1,
    textTransform: 'capitalize',
  },
  alarmButtonIcon: {
    color: ({ type }) => (type ? pathStr(alarmIcons[type].color, theme.palette) : 'initial'),
    paddingRight: theme.spacing(1),
  },
  alarmButtonCount: {
    paddingRight: theme.spacing(2.5),
  },
}))

const alarmIcons = {
  fatal: {
    color: 'error.main',
    icon: 'skull-crossbones',
  },
  critical: {
    color: 'warning.main',
    icon: 'engine-warning',
  },
  warning: {
    color: 'warning.light',
    icon: 'exclamation-triangle',
  },
}

const ClusterAlarmButton = ({ type, count, active, onClick }) => {
  const classes = useStyles({ type, active, count })
  return (
    <div className={classes.alarmButton} onClick={() => count && onClick()}>
      <FontAwesomeIcon>{active ? 'angle-down' : 'angle-right'}</FontAwesomeIcon>
      <FontAwesomeIcon solid size="sm" className={classes.alarmButtonIcon}>
        {alarmIcons[type].icon}
      </FontAwesomeIcon>
      <Text variant="body2" className={classes.alarmButtonType}>
        {type}
      </Text>
      <Text variant="subtitle1" className={classes.alarmButtonCount}>
        {count}
      </Text>
    </div>
  )
}

export default ClusterAlarmButton
