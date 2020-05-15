import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import ProgressBar from 'core/components/progress/ProgressBar'
import Tooltip from '@material-ui/core/Tooltip'
import { identity } from 'ramda'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    paddingBottom: theme.spacing(0.5),
  },
  label: {
    fontSize: 12,
    width: 58,
    fontWeight: 'bold',
  },
  rightAlign: {
    textAlign: 'right',
  },
  value: {
    fontSize: 12,
    whiteSpace: 'nowrap',
    width: 135,
    paddingRight: 4,
    display: 'grid',
    gridTemplateColumns: '1fr 4px 1fr 25px',
    gridGap: '4px',
  },
  percent: {
    width: 152,
  },
  percentGrid: {
    display: 'grid',
    justifyItems: 'end',
    gridGap: 4,
    gridTemplateColumns: '25px min-content',
  },
}))

const ResourceUsageTable = ({ label, valueConverter, usedText, units, stats, precision }) => {
  const classes = useStyles()
  const { current, max, percent = (current / max) * 100 } = stats

  const curStr = valueConverter(current).toFixed(precision)
  const maxStr = valueConverter(max).toFixed(precision)
  const percentStr = (
    <span className={classes.percentGrid}>
      <span>{Math.round(percent)}%</span>
      <span>{usedText}</span>
    </span>
  )
  return (
    <Tooltip title={`${curStr} ${units} of ${maxStr} ${units} ${usedText}`}>
      <div className={classes.root}>
        <span className={classes.label}>{label}:</span>
        <span className={classes.value}>
          <span className={classes.rightAlign}>{curStr}</span>
          <span>/</span>
          <span>{maxStr}</span>
          <span>{units}</span>
        </span>
        <span className={classes.percent}>
          <ProgressBar width={140} variant="health" percent={percent} label={percentStr} />
        </span>
      </div>
    </Tooltip>
  )
}

ResourceUsageTable.propTypes = {
  valueConverter: PropTypes.func,
  precision: PropTypes.number,
  label: PropTypes.string,
  usedText: PropTypes.string,
  units: PropTypes.string,
  stats: PropTypes.shape({
    current: PropTypes.number,
    max: PropTypes.number,
    percent: PropTypes.number,
  }),
}

ResourceUsageTable.defaultProps = {
  stats: { current: 0, max: 0, percent: 0 },
  valueConverter: identity,
  usedText: 'used',
  units: '',
  precision: 2,
}

export default ResourceUsageTable
