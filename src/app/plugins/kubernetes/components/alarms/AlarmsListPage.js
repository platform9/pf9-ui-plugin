import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import SeverityPicklist from './SeverityPicklist'
import TimePicklist from './TimePicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadAlerts, loadTimeSeriesAlerts, alertsCacheKey } from './actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'
import { pick } from 'ramda'
import { allKey } from 'app/constants'
import PageContainer from 'core/components/pageContainer/PageContainer'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import StackedAreaChart from 'core/components/graphs/StackedAreaChart'
import moment from 'moment'
import { makeStyles } from '@material-ui/styles'
import DateCell from 'core/components/listTable/cells/DateCell'

const useStyles = makeStyles((theme) => ({
  header: {
    width: '100%',
    margin: '15px 15px 0px 15px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginRight: '20px',
  },
  chartLabel: {
    flexGrow: 0,
    fontSize: '18px',
  },
  chartFilters: {
    display: 'flex',
    flexGrow: 0,
  },
  clusterPicker: {
    flexGrow: 0,
    marginRight: '20px',
  },
  timePicker: {
    flexGrow: 0,
  },
  moveLeft: {
    position: 'relative',
    right: '15px',
  }
}))

const chartKeys = [
  {
    name: 'warning',
    color: 'warning.lighter',
  },
  {
    name: 'critical',
    color: 'warning.main'
  },
  {
    name: 'fatal',
    color: 'error.main'
  }
]

const chartTimeDisplay = {
  '24.h': '24 Hours',
  '12.h': '12 Hours',
  '6.h': '6 Hours',
  '3.h': '3 Hours',
  '1.h': '1 Hour',
}

const defaultParams = {
  severity: allKey,
  chartTime: '24.h',
}
const usePrefParams = createUsePrefParamsHook('Alerts', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const classes = useStyles({})
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(loadAlerts, params)
    const [timeSeriesData, timeSeriesLoading, timeSeriesReload] = useDataLoader(loadTimeSeriesAlerts, params)
    const filteredAlerts = data.filter((alert) => {
      if (params.severity === allKey) {
        return true
      }
      return params.severity === alert.severity
    })

    return (
      <PageContainer>
        <Tabs>
          <Tab value="alert" label="Alarm Overview">
            <div className={classes.header}>
              <div className={classes.chartHeader}>
                <div className={classes.chartLabel}>Alarms Past {chartTimeDisplay[params.chartTime]}</div>
                <div className={classes.chartFilters}>
                  <div className={classes.clusterPicker}>
                    <ClusterPicklist
                      onChange={getParamsUpdater('chartClusterId')}
                      value={params.chartClusterId}
                      onlyMasterNodeClusters
                    />
                  </div>
                  <div className={classes.timePicker}>
                    <TimePicklist
                      onChange={getParamsUpdater('chartTime')}
                      value={params.chartTime}
                    />
                  </div>
                </div>
              </div>
              <div className={classes.moveLeft}>
                <StackedAreaChart
                  values={timeSeriesData}
                  keys={chartKeys}
                  xAxis="time"
                  responsive={true}
                />
              </div>
            </div>
            <ListContainer
              loading={loading}
              reload={reload}
              data={filteredAlerts}
              getParamsUpdater={getParamsUpdater}
              filters={
                <>
                  <ClusterPicklist
                    onChange={getParamsUpdater('clusterId')}
                    value={params.clusterId}
                    onlyMasterNodeClusters
                  />
                  <SeverityPicklist
                    name="severity"
                    label="Severity"
                    selectFirst={false}
                    onChange={getParamsUpdater('severity')}
                    value={params.severity}
                  />
                </>
              }
              {...pick(listTablePrefs, params)}
            />
          </Tab>
        </Tabs>
      </PageContainer>
    )
  }
}

export const options = {
  // addUrl: '/ui/kubernetes/rbac/roles/add',
  // addText: 'Add Role',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'severity', label: 'Severity' },
    { id: 'activeAt', label: 'Time', render: (value) => <DateCell value={value} /> },
    { id: 'summary', label: 'Rule Summary' },
    { id: 'clusterName', label: 'Cluster' },
  ],
  cacheKey: alertsCacheKey,
  // deleteFn: roleActions.delete,
  // editUrl: '/ui/kubernetes/rbac/roles/edit',
  name: 'Alarms',
  title: 'Alarms',
  showCheckboxes: false,
  ListPage,
}
const components = createCRUDComponents(options)
export const AlarmsList = components.List

export default components.ListPage
