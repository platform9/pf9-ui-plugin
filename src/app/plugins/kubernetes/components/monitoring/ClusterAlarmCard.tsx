import React, { useCallback, useState } from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import Text from 'core/elements/text'
import SimpleLink from 'core/components/SimpleLink'
import { routes } from 'core/utils/routes'
import ListTable from 'core/components/listTable/ListTable'
import AlarmDetailsLink from '../alarms/AlarmDetailsLink'
import { IAlertSelector } from '../alarms/model'
import DateCell from 'core/components/listTable/cells/DateCell'
import clsx from 'clsx'
import ClusterAlarmButton from './ClusterAlarmButton'
import ExternalLink from 'core/components/ExternalLink'

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  alarmCard: {
    padding: theme.spacing(2, 3, 1.5, 2.5),
    boxShadow: '0 2.5px 2.5px -1.5px rgba(0, 0, 0, 0.2), 0 1.5px 7px 1px rgba(0, 0, 0, 0.12)',
    marginTop: theme.spacing(1.5),
  },
  alarmCardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alarmCardHeader: {
    marginBottom: theme.spacing(2),
  },
  alarmCount: {
    display: 'flex',
    alignItems: 'center',
  },
  alarmNumber: {
    marginLeft: theme.spacing(1.5),
  },
  alarmButtonGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridColumnGap: theme.spacing(1),
  },
  alarmCardLinks: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    columnGap: theme.spacing(3),
  },
}))

const getAlarmsOfType = (cluster, type) => {
  return cluster[`${type}Alarms`] || []
}

type RenderFn<T extends keyof IAlertSelector> = (
  value: IAlertSelector[T],
  row: IAlertSelector,
) => any

const render = <T extends keyof IAlertSelector>(fn: RenderFn<T>) => (
  value: IAlertSelector[T],
  row: IAlertSelector,
) => fn(value, row)

const columns = [
  {
    id: 'name',
    label: 'Name',
    render: render<'name'>((value, row) => <AlarmDetailsLink display={value} alarm={row} />),
  },
  {
    id: 'updatedAt',
    label: 'Time',
    render: render<'updatedAt'>((value) => (value ? <DateCell value={value} /> : <div>N/A</div>)),
  },
  {
    id: 'summary',
    label: 'Rule Summary',
    render: render<'summary'>((summary, alert) => summary || 'N/A'),
  },
  { id: 'status', label: 'Status', render: render<'summary'>((status) => status || 'N/A') },
  {
    id: 'exportedNamespace',
    label: 'Exported Namespace',
    render: render<'exportedNamespace'>((exportedNamespace) => exportedNamespace || 'N/A'),
  },
]

const ClusterAlarmCard = ({ cluster }) => {
  const [activeType, setActiveType] = useState('')
  const toggleType = useCallback(
    (type) => {
      if (type === activeType) {
        setActiveType('')
        return
      }
      setActiveType(type)
    },
    [activeType],
  )
  const classes = useStyles({})
  return (
    <div className={classes.alarmCard}>
      <div className={clsx(classes.alarmCardHeader, classes.alarmCardRow)}>
        <Text variant="subtitle1">{cluster.name}</Text>
        <div className={classes.alarmCardLinks}>
          <ExternalLink textVariant="caption1" icon="chart-line" url={cluster.usage.grafanaLink}>
            Grafana
          </ExternalLink>
          <SimpleLink
            textVariant="caption1"
            icon="search-plus"
            src={routes.cluster.nodes.path({ id: cluster.uuid })}
          >
            Cluster Details
          </SimpleLink>
        </div>
      </div>
      <div className={classes.alarmCardRow}>
        <div className={classes.alarmButtonGrid}>
          <ClusterAlarmButton
            type="fatal"
            count={cluster.fatalAlarms.length}
            active={activeType === 'fatal'}
            onClick={() => toggleType('fatal')}
          />
          <ClusterAlarmButton
            type="critical"
            count={cluster.criticalAlarms.length}
            active={activeType === 'critical'}
            onClick={() => toggleType('critical')}
          />
          <ClusterAlarmButton
            type="warning"
            count={cluster.warningAlarms.length}
            active={activeType === 'warning'}
            onClick={() => toggleType('warning')}
          />
        </div>
        <div className={classes.alarmCount}>
          <Text variant="caption1">Total Alarms</Text>
          <Text variant="subtitle1" className={classes.alarmNumber}>
            {cluster.numAlarms}
          </Text>
        </div>
      </div>
      {!!getAlarmsOfType(cluster, activeType).length && (
        <ListTable
          columns={columns}
          data={getAlarmsOfType(cluster, activeType)}
          showCheckboxes={false}
          compactTable
        />
      )}
    </div>
  )
}

export default ClusterAlarmCard
