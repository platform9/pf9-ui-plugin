import React from 'react'
import { makeStyles } from '@material-ui/styles'
import ProgressBar from 'core/components/progress/ProgressBar'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    paddingBottom: theme.spacing(0.5),
  },
  label: {
    width: 63,
    fontWeight: 'bold',
  },
  value: {
    width: 72,
  },
  percent: {
    width: 142,
  },
}))

const precision = 2

const ClusterResourceSpan = ({ label, stats }) => {
  const classes = useStyles()
  const { current, percent, type, units } = stats
  const curStr = current.toFixed(precision)
  // const maxStr = max.toFixed(precision)
  const percentStr = `${Math.round(percent)}% ${type}`
  return (
    <div className={classes.root}>
      <span className={classes.label}>{label}:</span>
      <span className={classes.value}>{curStr}{units}</span>
      <span className={classes.percent}>
        <ProgressBar
          width={140}
          percent={percent}
          label={percentStr}
        />
      </span>
    </div>
  )
}

export default ClusterResourceSpan
