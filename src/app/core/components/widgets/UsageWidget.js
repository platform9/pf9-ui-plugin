import React from 'react'
import PropTypes from 'prop-types'
import SemiCircleGraph from 'core/components/graphs/SemiCircleGraph'
import WidgetCard from 'core/components/widgets/WidgetCard'

const UsageWidget = ({ title, headerImg, precision, stats, ...rest }) => {
  const { current, max, percent, type, units } = stats

  const curStr = current.toFixed(precision) + units
  const maxStr = max.toFixed(precision) + units
  const percentStr = Math.round(percent)
  return (
    <WidgetCard title={title} headerImg={headerImg}>
      <SemiCircleGraph
        percentage={percentStr}
        label={`${curStr} ${type} of ${maxStr}`}
        {...rest}
      />
    </WidgetCard>
  )
}

UsageWidget.propTypes = {
  ...WidgetCard.propTypes,
  precision: PropTypes.number,
  stats: PropTypes.shape({
    current: PropTypes.number,
    max: PropTypes.number,
    percent: PropTypes.number,
    type: PropTypes.string,
    units: PropTypes.string,
  }),
}

UsageWidget.defaultProps = {
  precision: 1,
}

export default UsageWidget
