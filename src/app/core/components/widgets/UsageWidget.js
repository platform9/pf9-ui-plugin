import React from 'react'
import PropTypes from 'prop-types'
import SemiCircleGraph from 'core/components/graphs/SemiCircleGraph'
import WidgetCard from 'core/components/widgets/WidgetCard'

const defaultStats = { current: 0, max: 0, percent: 0 }

const UsageWidget = ({
  title,
  headerImg = undefined,
  precision = 1,
  units = '',
  usedText = 'used',
  stats = defaultStats,
  ...rest
}) => {
  const { current, max, percent } = stats

  const curStr = current.toFixed(precision) + units
  const maxStr = max.toFixed(precision) + units
  const percentStr = Math.round(percent)
  return (
    <WidgetCard title={title} headerImg={headerImg}>
      <SemiCircleGraph
        percentage={percentStr}
        label={`${curStr} ${usedText} of ${maxStr}`}
        {...rest}
      />
    </WidgetCard>
  )
}

UsageWidget.propTypes = {
  ...WidgetCard.propTypes,
  precision: PropTypes.number,
  usedText: PropTypes.string,
  units: PropTypes.string,
  stats: PropTypes.shape({
    current: PropTypes.number,
    max: PropTypes.number,
    percent: PropTypes.number,
  }),
}

export default UsageWidget
