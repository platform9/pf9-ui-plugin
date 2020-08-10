import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import SeverityPicklist from 'k8s/components/alarms/SeverityPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadAlerts, alertsCacheKey } from 'k8s/components/alarms/actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'
import { pick } from 'ramda'
import { allKey } from 'app/constants'
import ClusterPicklistDefault from 'k8s/components/common/ClusterPicklist'
import RuleDetailsLink from './RuleDetailsLink'
import { SeverityTableCell } from 'k8s/components/alarms/AlarmsListPage'
const ClusterPicklist: any = ClusterPicklistDefault

const defaultParams = {
  severity: allKey,
  clusterId: allKey,
  showNeverActive: true,
  orderBy: 'name',
  orderDirection: 'asc',
}
const usePrefParams = createUsePrefParamsHook('Rules', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(loadAlerts, params)
    // Provide specific param properties to timeSeries data loader
    // so that it doesn't reload unless those props are changed

    const filteredRules = data.filter((alert) => {
      return [allKey, alert.severity].includes(params.severity)
    })

    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={filteredRules}
        getParamsUpdater={getParamsUpdater}
        filters={
          <>
            <ClusterPicklist
              onChange={getParamsUpdater('clusterId')}
              value={params.clusterId}
              onlyMasterNodeClusters
              onlyPrometheusEnabled
              selectFirst={false}
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
    )
  }
}

export const options = {
  columns: [
    { id: 'name', label: 'Name', render: (value, row) => ( <RuleDetailsLink display={value} rule={row} /> )},
    { id: 'severity', label: 'Severity', render: (value) => (
        <SeverityTableCell value={value} />
      )
    },
    { id: 'summary', label: 'Summary' },
    { id: 'description', label: 'Description' },
    { id: 'query', label: 'Expressions' },
    { id: 'for', label: 'Duration' },
    { id: 'clusterName', label: 'Cluster' },
  ],
  cacheKey: alertsCacheKey,
  name: 'Rules',
  title: 'Rules',
  showCheckboxes: false,
  ListPage,
}
const components = createCRUDComponents(options)
export const AlarmsList = components.List

export default components.ListPage
