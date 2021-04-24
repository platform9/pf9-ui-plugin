import React, { useMemo, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import TimePicklistDefault from 'k8s/components/alarms/TimePicklist'
import StackedAreaChart from 'core/components/graphs/StackedAreaChart'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadAlerts, loadTimeSeriesAlerts } from 'k8s/components/alarms/actions'
import AlarmsChartTooltip from 'k8s/components/alarms/AlarmsChartTooltip'
import Progress from 'core/components/progress/Progress'
import { allKey, LoadingGifs } from 'app/constants'
import { IUseDataLoader } from '../nodes/model'
import { IAlertSelector } from 'k8s/components/alarms/model'
import createListTableComponent from 'core/helpers/createListTableComponent'
import AlarmDetailsLink from 'k8s/components/alarms/AlarmDetailsLink'
import { SeverityTableCell } from 'k8s/components/alarms/AlarmsListPage'
import DateCell from 'core/components/listTable/cells/DateCell'
import ExternalLink from 'core/components/ExternalLink'
import SnoozeAlarmDialog from 'k8s/components/alarms/SnoozeAlarmDialog'
import StatusPicklist from 'k8s/components/alarms/StatusPicklist'
import SeverityPicklist from 'k8s/components/alarms/SeverityPicklist'
const TimePicklist: any = TimePicklistDefault

const useStyles = makeStyles((theme: Theme) => ({
  alarmsHeader: {
    display: 'flex',
  },
  chartContainer: {
    marginLeft: theme.spacing(2),
    flexGrow: 1,
    border: `1px solid ${theme.palette.grey['500']}`,
    padding: theme.spacing(2),
    '& .progressContent.loading': {
      display: 'none',
    },
    marginTop: theme.spacing(2),
  },
  chart: {
    marginTop: theme.spacing(2),
  },
  filters: {
    display: 'inline-grid',
    gridTemplateColumns: 'auto auto auto',
    gridGap: theme.spacing(2.5),
  },
}))

const chartKeys = [
  {
    name: 'warning',
    color: 'warning.light',
    icon: 'exclamation-triangle',
  },
  {
    name: 'critical',
    color: 'warning.main',
    icon: 'engine-warning',
  },
  {
    name: 'fatal',
    color: 'error.main',
    icon: 'skull-crossbones',
  },
]

interface Props {
  alarms: IAlertSelector[]
  reload: any
  params: any
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
    display: false,
    id: 'fingerprint',
    label: 'Fingerprint',
    render: render<'fingerprint'>((fingerprint) => fingerprint),
  },
  {
    id: 'name',
    label: 'Name',
    render: render<'name'>((value, row) => <AlarmDetailsLink display={value} alarm={row} />),
  },
  {
    id: 'severity',
    label: 'Severity',
    render: render<'severity'>((value) => <SeverityTableCell value={value} />),
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
    id: 'grafanaLink',
    label: 'Open in Grafana',
    render: render<'grafanaLink'>((link) => (
      <ExternalLink className="no-wrap-text" icon="chart-line" url={link}>
        Grafana
      </ExternalLink>
    )),
  },
  {
    id: 'clusterName',
    label: 'Cluster',
    render: render<'clusterName'>((clusterName) => clusterName || 'N/A'),
  },
  {
    id: 'exportedNamespace',
    label: 'Exported Namespace',
    render: render<'exportedNamespace'>((exportedNamespace) => exportedNamespace || 'N/A'),
  },
  {
    display: false,
    id: 'startsAt',
    label: 'Starts At',
    render: render<'startsAt'>((value) => (value ? <DateCell value={value} /> : <div>N/A</div>)),
  },
  {
    display: false,
    id: 'endsAt',
    label: 'Ends At',
    render: render<'endsAt'>((value) => (value ? <DateCell value={value} /> : <div>N/A</div>)),
  },
]

const AlarmsTable = ({ alarms, reload, params }: Props) => {
  const TableComponent = useMemo(
    () =>
      createListTableComponent({
        title: 'Cluster Alarms',
        name: 'cluster-alarms',
        columns,
        onReload: reload,
        uniqueIdentifier: 'id',
        showCheckboxes: true,
        multiSelection: false,
        batchActions: [
          {
            label: 'Snooze',
            icon: 'snooze',
            dialog: SnoozeAlarmDialog,
          },
        ],
      }),
    [reload],
  )

  return <TableComponent data={alarms} listTableParams={params} />
}

const ClusterAlarms = ({ cluster, headerCard }) => {
  const classes = useStyles()
  const [params, setParams] = useState({
    severity: allKey,
    status: 'Active',
    chartTime: '24.h',
    clusterId: cluster.uuid,
  })

  const [timeSeriesData, timeSeriesLoading] = useDataLoader(loadTimeSeriesAlerts, {
    chartTime: params.chartTime,
    clusterId: params.clusterId,
  })
  const [alarms, loadingAlarms, reload]: IUseDataLoader<IAlertSelector> = useDataLoader(
    loadAlerts,
    params,
  ) as any

  const filteredChartKeys = chartKeys.filter((key) => {
    return [allKey, key.name].includes(params.severity)
  })

  const filteredAlarms = alarms.filter((alarm) => {
    return (
      [allKey, alarm.severity].includes(params.severity) &&
      [allKey, alarm.status].includes(params.status)
    )
  })

  return (
    <>
      <div className={classes.alarmsHeader}>
        {headerCard}
        <div className={classes.chartContainer}>
          <div className={classes.filters}>
            <StatusPicklist
              name="status"
              label="Status"
              selectFirst={false}
              onChange={(value) => setParams({ ...params, status: value })}
              value={params.status}
            />
            <SeverityPicklist
              name="severity"
              label="Severity"
              selectFirst={false}
              onChange={(value) => setParams({ ...params, severity: value })}
              value={params.severity}
            />
            <TimePicklist
              onChange={(value) => setParams({ ...params, chartTime: value })}
              value={params.chartTime}
            />
          </div>
          <Progress
            loading={timeSeriesLoading}
            overlay={false}
            maxHeight={180}
            minHeight={180}
            loadingImage={LoadingGifs.BluePinkTiles}
          >
            <div className={classes.chart}>
              <StackedAreaChart
                values={timeSeriesData}
                keys={filteredChartKeys}
                xAxis="time"
                responsive
                responsiveHeight={180}
                CustomTooltip={<AlarmsChartTooltip keys={filteredChartKeys} />}
              />
            </div>
          </Progress>
        </div>
      </div>
      <Progress loading={loadingAlarms}>
        <AlarmsTable alarms={filteredAlarms} reload={reload} params={params} />
      </Progress>
    </>
  )
}

export default ClusterAlarms
