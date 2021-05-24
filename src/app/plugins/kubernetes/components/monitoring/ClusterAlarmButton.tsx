import React from 'react'
import { makeStyles } from '@material-ui/core'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Text from 'core/elements/text'
import { pathStr } from 'utils/fp'
import { hexToRgbaCss } from 'core/utils/colorHelpers'
import Theme from 'core/themes/model'

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
          return `1px solid ${hexToRgbaCss(theme.palette.red[500], 0.2)}`
        } else if (type === 'critical') {
          return `1px solid ${hexToRgbaCss(theme.palette.orange[500], 0.2)}`
        } else if (type === 'warning') {
          return `1px solid ${hexToRgbaCss(theme.palette.yellow[500], 0.2)}`
        }
      }
      return 'none'
    },
    cursor: ({ count }) => (count ? 'pointer' : ''),
    color: ({ count }) => (count ? '' : theme.palette.grey[300]),
    background: ({ type, active, count }) => {
      if (active) {
        return 'none'
      }
      if (!count) {
        return theme.palette.grey[200]
      }
      if (type === 'fatal') {
        return hexToRgbaCss(theme.palette.red[500], 0.2)
      } else if (type === 'critical') {
        return hexToRgbaCss(theme.palette.orange[500], 0.2)
      } else if (type === 'warning') {
        return hexToRgbaCss(theme.palette.yellow[500], 0.2)
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
