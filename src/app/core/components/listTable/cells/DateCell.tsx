import React from 'react'
import { formatDate, secondsToString } from 'utils/misc'
import { Tooltip } from '@material-ui/core'
import moment from 'moment'

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
      <Tooltip title={secondsToString(moment().diff(value, 's'))}>
        <span>{formatDate(value, format)}</span>
      </Tooltip>
    )
  }

  return <span>{formatDate(value, format)}</span>
}

export default DateCell
