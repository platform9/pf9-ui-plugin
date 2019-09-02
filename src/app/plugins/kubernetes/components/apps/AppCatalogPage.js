import React, { useCallback } from 'react'
import CardTable from 'core/components/cardTable/CardTable'
import AppCard from 'k8s/components/apps/AppCard'
import moment from 'moment'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { appActions } from 'k8s/components/apps/actions'
import RepositoryPicklist from 'k8s/components/apps/RepositoryPicklist'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'

const sortingConfig = [
  {
    field: 'attributes.name',
    label: 'Name',
  },
  {
    field: 'relationships.latestChartVersion.data.created',
    label: 'Created',
    sortWith: (prevDate, nextDate) =>
      moment(prevDate).isBefore(nextDate) ? 1 : -1,
  },
]
const defaultParams = {
  appCatalogClusters: true,
}
const usePrefParams = createUsePrefParamsHook('AppCatalog', listTablePrefs)

const AppCatalogPage = () => {
  const { params, getParamsUpdater } = usePrefParams(defaultParams)
  const [apps, loading, reload] = useDataLoader(appActions.list, params)
  const handleRefresh = useCallback(() => reload(true), [reload])
  const renderCardItems = useCallback(item =>
    <AppCard application={item} key={item.id} />, [])

  return <CardTable
    loading={loading}
    onRefresh={handleRefresh}
    data={apps}
    sorting={sortingConfig}
    searchTarget="attributes.name"
    filters={<>
      <ClusterPicklist
        showAll={false}
        label="Cluster"
        onlyAppCatalogEnabled
        onChange={getParamsUpdater('clusterId')}
        value={params.clusterId} />
      {params.clusterId && <RepositoryPicklist
        label="Repository"
        onChange={getParamsUpdater('repositoryId')}
        clusterId={params.clusterId}
        value={params.repositoryId}
      />}
    </>}
  >
    {renderCardItems}
  </CardTable>
}

export default AppCatalogPage
