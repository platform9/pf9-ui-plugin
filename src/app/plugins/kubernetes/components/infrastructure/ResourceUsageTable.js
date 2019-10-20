import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import ProgressBar from 'core/components/progress/ProgressBar'
import Tooltip from '@material-ui/core/Tooltip'
import { identity } from 'ramda'

const useStyles = makeStyles(theme => ({
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
  value: {
    fontSize: 12,
    whiteSpace: 'nowrap',
    width: 77,
  },
  percent: {
    width: 142,
  },
}))

const ResourceUsageTable = ({ label, valueConverter, usedText, units, stats, precision }) => {
  const classes = useStyles()
  const { current, max, percent } = stats
  const curStr = valueConverter(current).toFixed(precision)
  const maxStr = valueConverter(max).toFixed(precision)
  const percentStr = `${Math.round(percent)}% ${usedText}`
  return (
    <Tooltip title={`${curStr} ${units} of ${maxStr} ${units} ${usedText}`}>
      <div className={classes.root}>
        <span className={classes.label}>{label}:</span>
        <span className={classes.value}>{curStr} {units}</span>
        <span className={classes.percent}>
          <ProgressBar
            width={140}
            percent={percent}
            label={percentStr}
          />
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
  }).isRequired,
}

ResourceUsageTable.defaultProps = {
  valueConverter: identity,
  usedText: 'used',
  units: '',
  precision: 2,
}

export default ResourceUsageTable
