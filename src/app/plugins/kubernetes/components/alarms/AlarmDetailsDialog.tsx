import React from 'react'
import { Button, Dialog, DialogActions, Theme } from '@material-ui/core'
import Text from 'core/elements/text'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { makeStyles } from '@material-ui/styles'
import DisplayKeyValues from 'core/components/DisplayKeyValues'
import { formatDate } from 'utils/misc'
import { SeverityTableCell } from './AlarmsListPage'
import { IAlertSelector } from './model'
import renderLabels from '../pods/renderLabels'

interface Props {
  alarm: IAlertSelector
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
    alignItems: 'center',
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
  labels: {
    '& p:first-child': {
      marginTop: 0,
    },
  },
}))

// The modal is technically inside the row, so clicking anything inside
// the modal window will cause the table row to be toggled.
const stopPropagation = (e) => e.stopPropagation()

const AlarmDetailsDialog = ({ alarm, onClose }: Props) => {
  const classes = useStyles({})

  const upperValues = [
    { key: 'Event Time', value: formatDate(alarm.updatedAt) },
    {
      key: 'Alarm Severity',
      value: alarm.severity,
      render: (value) => <SeverityTableCell value={value} />,
    },
    { key: 'Alarm Summary', value: alarm.summary },
  ]
  const lowerValues = [
    {
      key: 'Labels',
      value: (
        <span className={classes.labels}>{renderLabels('labels', 'body1')(alarm?.labels)}</span>
      ),
    },
    { key: 'Conditions', value: alarm.query },
    { key: 'Duration', value: alarm.for || 'N/A' },
  ]

  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <div className={classes.container}>
        <div className={classes.header}>
          <Text variant="subtitle1">Alarm - {alarm.name}</Text>
          <FontAwesomeIcon className={classes.icon} onClick={onClose} size="xl">
            times
          </FontAwesomeIcon>
        </div>
        <div className={classes.upperBody}>
          <DisplayKeyValues keyValuePairs={upperValues} />
        </div>
        <div className={classes.lowerBody}>
          <DisplayKeyValues keyValuePairs={lowerValues} rowSpacing={24} />
        </div>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  )
}

export default AlarmDetailsDialog
