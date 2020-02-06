import React from 'react'
import { formatDate, durationBetweenDates, defaultDateFormat } from 'utils/misc'
import { Tooltip } from '@material-ui/core'

interface DateCellProps {
  value: string
  format?: string
  showToolTip?: boolean
}

const DateCell: React.FC<DateCellProps> = ({
  value,
  format = defaultDateFormat,
  showToolTip = false,
}) => {
  if (showToolTip) {
    return (
      <Tooltip title={durationBetweenDates({ ts: value })}>
        <span>{formatDate({ ts: value, format })}</span>
      </Tooltip>
    )
  }

  return <span>{formatDate({ ts: value, format })}</span>
}

export default DateCell
