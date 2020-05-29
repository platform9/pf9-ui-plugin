import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { pathStr } from 'utils/fp'

const useStyles = makeStyles((theme: Theme) => ({
  customTooltip: {
    background: '#ffffff',
    padding: theme.spacing(1),
    fontSize: 13,
    minWidth: 144,
  },
  customTooltipHeader: {
    borderBottom: '1px solid #d8d8d8',
    padding: theme.spacing(1),
  },
  customTooltipBody: {
    paddingTop: theme.spacing(2),
  },
  customTooltipEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  customTooltipLabel: {
    flexGrow: 0,
  },
  customTooltipName: {
    marginLeft: theme.spacing(1)
  },
  customTooltipCount: {
    flexGrow: 0,
    paddingRight: theme.spacing(1)
  },
}))

interface CustomTooltipProps {
  active?: boolean
  payload?: any
  label?: string
  keys: any[]
}

const CustomTooltip = ({ active, payload, label, keys }: CustomTooltipProps) => {
  const classes = useStyles({})
  const theme: any = useTheme()

  if (active && payload) {
    // Need data from both payload (count) & keys (icon, color)
    const countByKey = payload.reduce((acc, value) => {
      acc[value.name] = value.payload[value.name]
      return acc
    }, {})

    return (
      <div className={classes.customTooltip}>
        <div className={classes.customTooltipHeader}>
          Alarms @ {label}
        </div>
        <div className={classes.customTooltipBody}>
          {keys.map(({ name, color, icon }) => (
            <div key={name} className={classes.customTooltipEntry}>
              <div className={classes.customTooltipLabel}>
                <FontAwesomeIcon solid style={{color: pathStr(color, theme.palette)}}>{icon}</FontAwesomeIcon>
                <span className={classes.customTooltipName}>{name}</span>
              </div>
              <div className={classes.customTooltipCount}>{countByKey[name]}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export default CustomTooltip
