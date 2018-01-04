import React from 'react'
import PropTypes from 'prop-types'
import SemiCircle from 'core/components/dashboardGraphs/SemiCircle'
import { Card, CardHeader, CardContent } from '@material-ui/core'

const UsageWidget = ({ precision, stats, title, ...props }) => {
  const { current, max, percent, type, units } = stats

  const curStr = current.toFixed(precision) + units
  const maxStr = max.toFixed(precision) + units
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <SemiCircle
          percentage={percent}
          label={`${curStr} ${type} of ${maxStr}`}
          {...props}
        />
      </CardContent>
    </Card>
  )
}

UsageWidget.propTypes = {
  precision: PropTypes.number,
  title: PropTypes.string.isRequired,
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
