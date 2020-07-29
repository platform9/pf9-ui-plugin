import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
} from '@material-ui/core'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import DisplayKeyValues from 'core/components/DisplayKeyValues'
import { formatDate } from 'utils/misc'
import { SeverityTableCell } from './AlarmsListPage'
import { Alarm } from './model'

interface Props {
  alarm: Alarm
  onClose: () => void
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: `${theme.spacing(2.5)}px ${theme.spacing(3.5)}px`,
    width: '544px', // This interacts weirdly with mui dialog max width, just set the width
  },
  header: {
    color: theme.palette.primary.main,
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.primary.light}`,
    paddingBottom: theme.spacing(1.5),
  },
  icon: {
    cursor: 'pointer',
  },
  upperBody: {
    paddingTop: theme.spacing(3.5),
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.primary.light}`,
  },
  lowerBody: {
    borderBottom: `1px solid ${theme.palette.primary.light}`,
  },
  name: {
    fontSize: 18,
    color: theme.palette.common.black,
    fontWeight: 500,
    marginBottom: theme.spacing(1.5),
  },
}))

// The modal is technically inside the row, so clicking anything inside
// the modal window will cause the table row to be toggled.
const stopPropagation = (e) => e.stopPropagation()

const AlarmDetailsDialog = ({ alarm, onClose }: Props) => {
  const classes = useStyles({})

  const upperValues = [
    { key: 'Event Time', value: formatDate(alarm.activeAt) },
    { key: 'Alarm Severity', value: alarm.severity, render: (value) => <SeverityTableCell value={value} /> },
    { key: 'Alarm Summary', value: alarm.annotations.summary },
  ]
  const lowerValues = [
    { key: 'Alarm Description', value: alarm.summary },
    { key: 'Conditions', value: alarm.query },
    { key: 'Duration', value: alarm.for || 'N/A' },
  ]

  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <div className={classes.container}>
        <div className={classes.header}>
          <div>Alarm Details</div>
          <FontAwesomeIcon className={classes.icon} onClick={onClose}>times</FontAwesomeIcon>
        </div>
        <div className={classes.upperBody}>
          <div className={classes.name}>{alarm.name}</div>
          <DisplayKeyValues keyValuePairs={upperValues} />
        </div>
        <div className={classes.lowerBody}>
          <DisplayKeyValues keyValuePairs={lowerValues} rowSpacing={24} />
        </div>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={onClose}>
            Cancel
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  )
}

export default AlarmDetailsDialog
