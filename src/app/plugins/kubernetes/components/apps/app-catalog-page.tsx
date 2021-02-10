import React, { useCallback, useMemo } from 'react'
import CardTable from 'core/components/cardTable/card-table'
import useParams from 'core/hooks/useParams'
import { allKey } from 'app/constants'
import ClusterPicklistDefault from 'k8s/components/common/ClusterPicklist'
import AppCard from './app-card'
import useReactRouter from 'use-react-router'
import { routes } from 'core/utils/routes'
import useDataLoader from 'core/hooks/useDataLoader'
import { appActions } from './actions'
import RepositoryPicklist from './repository-picklist'
import { repositoriesForClusterLoader } from '../repositories/actions'
import { pluck } from 'ramda'
const ClusterPicklist: any = ClusterPicklistDefault

const defaultParams = {
  sortBy: 'asc',
  repositoryName: allKey,
  clusterId: allKey,
  repository: '',
}

const sortByOptions = [
  { label: 'A->Z', value: 'asc' },
  { label: 'Z->A', value: 'desc' },
]

const AppCatalogPage = () => {
  const { params, getParamsUpdater } = useParams(defaultParams)
  const { history } = useReactRouter()
  const [apps, loadingApps, reload] = useDataLoader(appActions.list)
  const [reposForCluster, loadingReposForCluster] = useDataLoader(
    repositoriesForClusterLoader,
    params,
  )

  const handleRefresh = useCallback(() => reload(true), [reload])

  const filters = useMemo(
    () => (
      <>
        <RepositoryPicklist onChange={getParamsUpdater('repository')} value={params.repository} />
        <ClusterPicklist
          onChange={getParamsUpdater('clusterId')}
          value={params.clusterId}
          selectFirst={false}
        />
      </>
    ),
    [params, getParamsUpdater],
  )

  const filterByCluster = useCallback(
    (apps) => {
      // Find the repos that are attached to the cluster
      const repoNames = pluck(
        'name',
        reposForCluster.filter((item) => item?.clusterId === params.clusterId),
      )
      if (!repoNames) {
        return []
      }
      return apps.filter((app) => repoNames.includes(app.repository))
    },
    [params.clusterId, reposForCluster],
  )

  const filterValues = useMemo(
    () => [
      { value: params.repository, target: 'repository' },
      { value: params.clusterId, customFilterFn: filterByCluster },
    ],
    [params.repository, params.clusterId, filterByCluster],
  )

  const handleOnClick = (app) => {
    history.push(routes.apps.deploy.path({ name: app.name, repository: app.repository }))
  }

  const renderAppCards = useCallback(
    (app) => <AppCard key={app.id} app={app} onClick={handleOnClick} />,
    [handleOnClick],
  )

  const loading = loadingApps || loadingReposForCluster

  return (
    <>
      <CardTable
        data={apps}
        searchTarget="name"
        filters={filters}
        filterValues={filterValues}
        showSortOption={true}
        sortOptions={sortByOptions}
        onSortChange={getParamsUpdater('sortBy')}
        sortBy={params.sortBy}
        sortTarget="name"
        loading={loading}
        handleRefresh={handleRefresh}
      >
        {renderAppCards}
      </CardTable>
    </>
  )
}

export default AppCatalogPage
