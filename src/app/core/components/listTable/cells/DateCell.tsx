import React from 'react'
import { formatDate, secondsToString } from 'utils/misc'
import { Tooltip } from '@material-ui/core'
import moment from 'moment'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles((theme) => ({
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
}))

interface DateCellProps {
  value: string
  format?: string
  showToolTip?: boolean
}

const DateCell: React.FC<DateCellProps> = ({ value, format, showToolTip = false }) => {
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

interface DateAndTimeProps {
  value: string
  dateFormat?: string
  timeFormat?: string
  showToolTip?: boolean
}

export const DateAndTime: React.FC<DateAndTimeProps> = ({
  value,
  dateFormat = 'MM/DD/YYYY',
  timeFormat = 'hh:mm A z',
  showToolTip = false,
}) => {
  const { column } = useStyles({})
  const content = (
    <div className={column}>
      <span>{formatDate(value, dateFormat)}</span>
      <span>{formatDate(value, timeFormat)}</span>
    </div>
  )
  if (showToolTip) {
    return <Tooltip title={secondsToString(moment().diff(value, 's'))}>{content}</Tooltip>
  }

  return content
}
