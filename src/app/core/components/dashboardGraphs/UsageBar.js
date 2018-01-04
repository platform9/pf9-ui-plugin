import React from 'react'
import PropTypes from 'prop-types'
import ProgressBar from 'core/components/ProgressBar'

const UsageBar = ({ precision, stats }) => {
  const { current, max, percent, type, units } = stats

  const curStr = current.toFixed(precision)
  const maxStr = max.toFixed(precision)
  const label = <span><strong>{percent}%</strong> - {curStr} / {maxStr}{units} {type}</span>
  return (
    <ProgressBar
      compact
      percent={percent}
      label={label}
    />
  )
}

UsageBar.propTypes = {
  precision: PropTypes.number,
  stats: PropTypes.shape({
    current: PropTypes.number,
    max: PropTypes.number,
    percent: PropTypes.number,
    type: PropTypes.string,
    units: PropTypes.string,
  }),
}

UsageBar.defaultProps = {
  precision: 2,
}

export default UsageBar
