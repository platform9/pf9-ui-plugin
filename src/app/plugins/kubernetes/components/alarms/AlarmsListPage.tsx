import React, { useEffect } from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import StatusPicklist from './StatusPicklist'
import SeverityPicklist from './SeverityPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadAlerts, loadTimeSeriesAlerts } from './actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey, LoadingGifs } from 'app/constants'
import { pick } from 'ramda'

import StackedAreaChart from 'core/components/graphs/StackedAreaChart'
import { makeStyles } from '@material-ui/styles'
import DateCell from 'core/components/listTable/cells/DateCell'
import ExternalLink from 'core/components/ExternalLink'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { pathStr } from 'utils/fp'
import { Theme } from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles'
import AlarmsChartTooltip from './AlarmsChartTooltip'
import ClusterPicklistDefault from 'k8s/components/common/ClusterPicklist'
import TimePicklistDefault from './TimePicklist'
import AlarmDetailsLink from './AlarmDetailsLink'
import { ActionDataKeys } from 'k8s/DataKeys'
import Progress from 'core/components/progress/Progress'
import { IUseDataLoader } from '../infrastructure/nodes/model'
import { IAlertSelector } from './model'
import SnoozeAlarmDialog from './SnoozeAlarmDialog'
const ClusterPicklist: any = ClusterPicklistDefault
const TimePicklist: any = TimePicklistDefault

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    width: '100%',
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
  },
  chartContainer: {
    border: `1px solid ${theme.palette.grey['500']}`,
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
    '& .progressContent.loading': {
      display: 'none',
    },
  },
  chartContainerHeader: {
    fontSize: 11,
    paddingBottom: theme.spacing(2),
  },
  chartLabel: {
    flexGrow: 0,
    fontSize: '18px',
  },
  chartFilters: {
    display: 'flex',
    flexGrow: 0,
  },
  chartRefresh: {
    fontSize: '18px',
    display: 'flex',
    marginRight: '15px',
  },
  clusterPicker: {
    flexGrow: 0,
    marginRight: '20px',
  },
  filters: {
    display: 'flex',
    flexGrow: 0,
  },
  timePicker: {
    flexGrow: 0,
  },
  moveLeft: {
    position: 'relative',
    right: '15px',
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

const defaultParams = {
  severity: allKey,
  chartTime: '24.h',
  clusterId: allKey,
  status: 'Active',
  showNeverActive: false,
}
const usePrefParams = createUsePrefParamsHook('Alerts', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const classes = useStyles({})
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload]: IUseDataLoader<IAlertSelector> = useDataLoader(
      loadAlerts,
      params,
    ) as any

    // Provide specific param properties to timeSeries data loader
    // so that it doesn't reload unless those props are changed
    const [timeSeriesData, timeSeriesLoading] = useDataLoader(loadTimeSeriesAlerts, {
      chartTime: params.chartTime,
      clusterId: params.clusterId,
    })

    const filteredChartKeys = chartKeys.filter((key) => {
      return [allKey, key.name].includes(params.severity)
    })

    const filteredAlerts = data.filter((alert) => {
      return (
        [allKey, alert.severity].includes(params.severity) &&
        [allKey, alert.status].includes(params.status)
      )
    })

    useEffect(() => {
      // workaround to nullify cache on reload / cluster change to match time series graph
      reload(true)
    }, [params.clusterId])

    return (
      <>
        <div className={classes.header}>
          <div className={classes.filters}>
            <div className={classes.clusterPicker}>
              <ClusterPicklist
                onChange={getParamsUpdater('clusterId')}
                value={params.clusterId}
                onlyMasterNodeClusters
                onlyPrometheusEnabled
                selectFirst={false}
              />
            </div>
            <div className={classes.clusterPicker}>
              <StatusPicklist
                name="status"
                label="Status"
                selectFirst={false}
                onChange={getParamsUpdater('status')}
                value={params.status}
              />
            </div>
            <SeverityPicklist
              name="severity"
              label="Severity"
              selectFirst={false}
              onChange={getParamsUpdater('severity')}
              value={params.severity}
            />
          </div>
          <div className={classes.timePicker}>
            <TimePicklist onChange={getParamsUpdater('chartTime')} value={params.chartTime} />
          </div>
        </div>
        <div className={classes.chartContainer}>
          <Progress
            loading={timeSeriesLoading}
            overlay={false}
            maxHeight={160}
            minHeight={320}
            loadingImage={LoadingGifs.BluePinkTiles}
          >
            <div className={classes.chartContainerHeader}>Alarms</div>
            <div className={classes.moveLeft}>
              <StackedAreaChart
                values={timeSeriesData}
                keys={filteredChartKeys}
                xAxis="time"
                responsive
                CustomTooltip={<AlarmsChartTooltip keys={filteredChartKeys} />}
              />
            </div>
          </Progress>
        </div>
        <ListContainer
          loading={loading}
          reload={reload}
          data={filteredAlerts}
          getParamsUpdater={getParamsUpdater}
          // Todo: Instead of listTableParams to pass params through to dialog,
          // using redux for accessing table state would be better
          listTableParams={params}
          {...pick(listTablePrefs, params)}
        />
      </>
    )
  }
}

export const SeverityTableCell = ({ value }) => {
  const theme: any = useTheme()
  const key = chartKeys.find((key) => key.name === value)
  return key ? (
    <div>
      <FontAwesomeIcon solid style={{ color: pathStr(key.color, theme.palette) }}>
        {key.icon}
      </FontAwesomeIcon>{' '}
      {value}
    </div>
  ) : (
    <div>{value}</div>
  )
}
// TODO expand this options interface to be all the helper supports when we refactor that to TS
interface IOptions {
  columns: Array<{
    display?: boolean
    id: keyof IAlertSelector
    label: string
    render?: RenderFn<keyof IAlertSelector>
  }>
  cacheKey: string
  name: string
  title: string
  multiSelection: boolean
  batchActions: Array<{
    label: string
    icon: string
    dialog: any
  }>
  ListPage: any
}
type RenderFn<T extends keyof IAlertSelector> = (
  value: IAlertSelector[T],
  row: IAlertSelector,
) => any
const render = <T extends keyof IAlertSelector>(fn: RenderFn<T>) => (
  value: IAlertSelector[T],
  row: IAlertSelector,
) => fn(value, row)

export const options: IOptions = {
  columns: [
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
  ],
  cacheKey: ActionDataKeys.Alerts,
  name: 'Alarms',
  title: 'Alarms',
  batchActions: [
    {
      label: 'Snooze',
      icon: 'snooze',
      dialog: SnoozeAlarmDialog,
    },
  ],
  multiSelection: false,
  ListPage,
}
const components = createCRUDComponents(options)
export const AlarmsList = components.List

export default components.ListPage
