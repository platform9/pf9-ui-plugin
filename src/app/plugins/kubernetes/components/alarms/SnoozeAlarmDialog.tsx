import React, { useCallback, useState } from 'react'
import { Dialog, Theme } from '@material-ui/core'
import Text from 'core/elements/text'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { makeStyles } from '@material-ui/styles'
import DisplayKeyValues from 'core/components/DisplayKeyValues'
import { formatDate } from 'utils/misc'
import { SeverityTableCell } from './AlarmsListPage'
import { IAlertSelector } from './model'
import SnoozeTimerPicklist from './SnoozeTimerPicklist'
import SubmitButton from 'core/components/buttons/SubmitButton'
import clsx from 'clsx'
import { keys, prop } from 'ramda'
import moment from 'moment'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { useSelector } from 'react-redux'
import { RootState } from 'app/store'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { loadAlerts, silenceActions } from './actions'
import Progress from 'core/components/progress/Progress'
import useDataLoader from 'core/hooks/useDataLoader'

interface Props {
  rows: Array<IAlertSelector>
  onClose: () => void
  listTableParams: any
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
  snoozeBody: {
    padding: theme.spacing(3, 0, 4),
    borderBottom: `1px solid ${theme.palette.primary.light}`,
  },
  upperBody: {
    paddingTop: theme.spacing(3.5),
    paddingBottom: theme.spacing(2),
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
  flex: {
    display: 'flex',
    alignItems: 'center',
  },
  submit: {
    justifyContent: 'space-between',
    paddingTop: theme.spacing(4),
  },
  snoozePicklist: {
    marginLeft: theme.spacing(2),
  },
  paddingRight: {
    paddingRight: theme.spacing(7.5),
  },
  nowrap: {
    whiteSpace: 'nowrap',
  },
}))

// The modal is technically inside the row, so clicking anything inside
// the modal window will cause the table row to be toggled.
const stopPropagation = (e) => e.stopPropagation()

const SnoozeAlarmDialog = ({ rows: [alarm], onClose, listTableParams }: Props) => {
  const classes = useStyles({})
  const [snoozeTime, setSnoozeTime] = useState('12.h')
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const { username } = session
  const [, , reloadAlarms] = useDataLoader(loadAlerts, listTableParams)
  const [handleAdd, addingSilence] = useDataUpdater(silenceActions.create, () => {
    reloadAlarms(true)
    onClose()
  })

  const createSnooze = useCallback(() => {
    const labelKeys = keys(alarm.labels)
    // Match the alarm labels completely (some alarms differ by only 1 property)
    const matchers = labelKeys.map((k) => ({ name: k, value: alarm.labels[k], isRegex: false }))
    const timeParts = snoozeTime.split('.')
    const currentTime = moment()
    // @ts-ignore
    const futureTime = moment(currentTime).add(parseInt(timeParts[0]), timeParts[1])
    const timeFormat = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
    const body = {
      matchers,
      startsAt: currentTime.utc().format(timeFormat),
      endsAt: futureTime.utc().format(timeFormat),
      comment: '',
      createdBy: username,
    }
    handleAdd({ clusterId: alarm.clusterId, body })
  }, [snoozeTime])

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
    { key: 'Conditions', value: alarm.query },
    { key: 'Duration', value: alarm.for || 'N/A' },
  ]

  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <Progress loading={addingSilence} renderContentOnMount maxHeight={60}>
        <div className={classes.container}>
          <div className={classes.header}>
            <Text variant="subtitle1">Snooze Alarm</Text>
            <FontAwesomeIcon className={classes.icon} onClick={onClose} size="xl">
              times
            </FontAwesomeIcon>
          </div>
          <div className={classes.snoozeBody}>
            <div className={classes.flex}>
              <Text variant="body2">Snooze for</Text>
              <div className={classes.snoozePicklist}>
                <SnoozeTimerPicklist onChange={setSnoozeTime} value={snoozeTime} />
              </div>
            </div>
            <div className={clsx(classes.flex, classes.submit)}>
              <Text variant="caption3" className={classes.paddingRight}>
                By snoozing an alarm no more events or notifications will fire for the selected
                period.
              </Text>
              <SubmitButton className={classes.nowrap} onClick={createSnooze}>
                SNOOZE ALARM
              </SubmitButton>
            </div>
          </div>
          <div className={classes.upperBody}>
            <Text variant="subtitle1">{alarm.name}</Text>
            <DisplayKeyValues keyValuePairs={upperValues} />
          </div>
          <div>
            <DisplayKeyValues keyValuePairs={lowerValues} rowSpacing={24} />
          </div>
        </div>
      </Progress>
    </Dialog>
  )
}

export default SnoozeAlarmDialog
