import React, { useCallback, useState, useEffect } from 'react'
import moize from 'moize'
import CardTable from 'core/components/cardTable/CardTable'
import AppCard from 'k8s/components/apps/AppCard'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { appActions, appsCacheKey } from 'k8s/components/apps/actions'
import RepositoryPicklist from 'k8s/components/apps/RepositoryPicklist'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import AppDeployDialog from 'k8s/components/apps/AppDeployDialog'
import AppDownloadDialog from 'k8s/components/apps/AppDownloadDialog'
import createCacheSelector from 'core/helpers/createCacheSelector'
import { useSelector } from 'react-redux'

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
const cacheSelector = createCacheSelector(appsCacheKey)

const AppCatalogPage = () => {
  const { params, updateParams, getParamsUpdater } = usePrefParams(defaultParams)
  const updateClusterId = useCallback((clusterId) => {
    updateParams({
      clusterId,
      repositoryId: allKey,
    })
  }, [])
  const [showingDeployDialog, setShowingDeployDialog] = useState(false)
  const [showingDownloadDialog, setShowingDownloadDialog] = useState(false)
  const [activeApp, setActiveApp] = useState()
  const [apps, loading, reload] = useSelector(cacheSelector(params))
  useEffect(() => {
    appActions.list(params)
  }, [])
  const [apps, loading, reload] = useDataLoader(appActions.list, params)

  const handleRefresh = useCallback(() => reload(true), [reload])
  const handleDeploy = useCallback(
    moize((app) => () => {
      setActiveApp(app)
      setShowingDeployDialog(true)
    }),
    [],
  )
  const handleDownload = useCallback(
    moize((app) => () => {
      setActiveApp(app)
      setShowingDownloadDialog(true)
    }),
    [],
  )
  const renderCardItems = useCallback(
    (item) => (
      <AppCard
        key={item.id}
        application={item}
        onDeploy={handleDeploy(item)}
        onDownload={handleDownload(item)}
        clusterId={params.clusterId}
      />
    ),
    [params.clusterId],
  )

  return (
    <>
      {showingDeployDialog && (
        <AppDeployDialog app={activeApp} onClose={() => setShowingDeployDialog(false)} />
      )}
      {showingDownloadDialog && (
        <AppDownloadDialog app={activeApp} onClose={() => setShowingDownloadDialog(false)} />
      )}
      <CardTable
        loading={loading}
        onRefresh={handleRefresh}
        data={apps}
        sorting={sortingConfig}
        orderBy={params.orderBy}
        orderDirection={params.orderDirection}
        onSortChange={getParamsUpdater('orderBy', 'orderDirection')}
        searchTarget="name"
        filters={
          <>
            <ClusterPicklist
              showAll={false}
              onlyAppCatalogEnabled
              onChange={updateClusterId}
              value={params.clusterId}
            />
            <RepositoryPicklist
              onChange={getParamsUpdater('repositoryId')}
              value={params.repositoryId}
            />
          </>
        }
      >
        {renderCardItems}
      </CardTable>
    </>
  )
}

export default AppCatalogPage
