import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import ProgressBar from 'core/components/progress/ProgressBar'
import Tooltip from '@material-ui/core/Tooltip'
import { identity } from 'ramda'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    gridTemplateColumns: ({ valueOff }) => (!valueOff ? '58px 1fr 138px' : '58px 138px'),
  },
  label: {
    color: theme.palette.grey[500],
  },
  rightAlign: {
    textAlign: 'right',
    ...theme.typography.h4,
  },
  value: {
    whiteSpace: 'nowrap',
    paddingRight: 4,
    display: ({ valueOff }) => (!valueOff ? 'grid' : 'none'),
    gridTemplateColumns: '1fr 4px 1fr 35px',
    gridGap: '4px',
  },
  percent: {
    width: 30,
  },
  percentGrid: {
    padding: theme.spacing(0.5, 0),
  },
}))

const ResourceUsageTable = ({
  valueOff = false,
  label,
  valueConverter,
  usedText,
  units,
  stats,
  precision,
}) => {
  const classes = useStyles({ valueOff })
  const { current, max, percent = (current / max) * 100 } = stats

  const curStr = valueConverter(current).toFixed(precision)
  const maxStr = valueConverter(max).toFixed(precision)
  const percentStr = <span className={classes.percent}>{Math.round(percent)}%</span>
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
        <span className={classes.percentGrid}>
          <ProgressBar width={138} variant="health" percent={percent} label={percentStr} />
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
