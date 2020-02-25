import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import SeverityPicklist from './SeverityPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadAlerts, alertsCacheKey } from './actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'
import { pick } from 'ramda'
import { allKey } from 'app/constants'
import PageContainer from 'core/components/pageContainer/PageContainer'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'

const defaultParams = {
  clusterId: allKey,
  severity: allKey,
}
const usePrefParams = createUsePrefParamsHook('Alerts', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(loadAlerts, params)

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
    { id: 'activeAt', label: 'Time' },
    { id: 'summary', label: 'Rule Summary' },
    // { id: 'clusterName', label: 'Cluster' },
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
