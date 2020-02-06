import React from 'react'
import { formatDate, durationBetweenDates } from 'utils/misc'
import { Tooltip } from '@material-ui/core'

interface DateCellProps {
  value: string
  format?: string
  showToolTip?: boolean
}

const DateCell: React.FC<DateCellProps> = ({
  value,
  format,
  showToolTip = false,
}) => {
  if (showToolTip) {
    return (
      <Tooltip title={durationBetweenDates(value)}>
        <span>{formatDate(value, format)}</span>
      </Tooltip>
    )
  }

  return <span>{formatDate(value, format)}</span>
}

export default DateCell
