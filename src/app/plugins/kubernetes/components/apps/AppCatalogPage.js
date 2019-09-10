import React, { useCallback } from 'react'
import CardTable from 'core/components/cardTable/CardTable'
import AppCard from 'k8s/components/apps/AppCard'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { appActions } from 'k8s/components/apps/actions'
import RepositoryPicklist from 'k8s/components/apps/RepositoryPicklist'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'

const sortingConfig = [
  {
    field: 'name',
    label: 'Name',
  },
  {
    field: 'created',
    label: 'Created',
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
    orderBy={params.orderBy}
    orderDirection={params.orderDirection}
    onSortChange={getParamsUpdater('orderBy', 'orderDirection')}
    searchTarget="name"
    filters={<>
      <ClusterPicklist
        showAll={false}
        onlyAppCatalogEnabled
        onChange={getParamsUpdater('clusterId')}
        value={params.clusterId} />
      <RepositoryPicklist
        onChange={getParamsUpdater('repositoryId')}
        value={params.repositoryId}
      />
    </>}
  >
    {renderCardItems}
  </CardTable>
}

export default AppCatalogPage
