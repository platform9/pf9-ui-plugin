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
import { SeverityTableCell } from 'k8s/components/alarms/AlarmsListPage'
import { Alarm } from 'k8s/components/alarms/model'
import DisplayLabels from 'core/components/DisplayLabels'

interface Props {
  rule: Alarm
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

const RuleDetailsDialog = ({ rule, onClose }: Props) => {
  const classes = useStyles({})

  const upperValues = [
    { key: 'Alarm Severity', value: rule.severity, render: (value) => <SeverityTableCell value={value} /> },
    { key: 'Alarm Summary', value: rule.summary },
  ]
  const lowerValues = [
    { key: 'Alarm Description', value: rule.description },
    { key: 'Conditions', value: rule.query },
    { key: 'Duration', value: rule.for || 'N/A' },
    { key: 'Labels', value: rule.labels, render: (value) => <DisplayLabels labels={value} />},
    { key: 'Annotations', value: rule.annotations, render: (value) => <DisplayLabels labels={value} />},
  ]

  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <div className={classes.container}>
        <div className={classes.header}>
          <div>Rule Details</div>
          <FontAwesomeIcon className={classes.icon} onClick={onClose}>times</FontAwesomeIcon>
        </div>
        <div className={classes.upperBody}>
          <div className={classes.name}>{rule.name}</div>
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
export default RuleDetailsDialog
