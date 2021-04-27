import { listTablePrefs } from 'app/constants'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import useDataLoader from 'core/hooks/useDataLoader'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { routes } from 'core/utils/routes'
import DataKeys from 'k8s/DataKeys'
import { pick } from 'ramda'
import React, { useCallback, useMemo } from 'react'
import ClusterPicklistDefault from '../../common/ClusterPicklist'
import NamespacePicklistDefault from '../../common/NamespacePicklist'
import { repositoryActions } from '../repositories/actions'
import NoRepositoriesMessage from '../repositories/no-repositories-message'
import { deployedAppActions } from './actions'
const ClusterPicklist: any = ClusterPicklistDefault
const NamespacePicklist: any = NamespacePicklistDefault

const defaultParams = {
  masterNodeClusters: true,
}
const usePrefParams = createUsePrefParamsHook('Deployed Apps', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, updateParams, getParamsUpdater } = usePrefParams(defaultParams)
    const [deployedApps, loadingDeployedApps, reload] = useDataLoader(
      deployedAppActions.list,
      params,
    )
    const [repositories, loadingRepositories] = useDataLoader(repositoryActions.list)

    const filteredDeployedApps = useMemo(
      () => deployedApps.filter((app) => app.status !== 'uninstalling'),
      [deployedApps],
    )

    const noRepositoriesMessage = useMemo(
      () =>
        loadingRepositories || (repositories && repositories.length > 0) ? null : (
          <NoRepositoriesMessage />
        ),
      [loadingRepositories, repositories],
    )

    const updateClusterId = useCallback((clusterId) => {
      updateParams({
        clusterId,
        namespace: null,
      })
    }, [])

    return (
      <ListContainer
        loading={loadingDeployedApps || loadingRepositories}
        reload={reload}
        data={filteredDeployedApps}
        getParamsUpdater={getParamsUpdater}
        alternativeTableContent={noRepositoriesMessage}
        filters={
          <>
            <ClusterPicklist
              // onChange={getParamsUpdater('clusterId')}
              onChange={updateClusterId}
              value={params.clusterId}
              onlyMasterNodeClusters
              showAll={false}
            />
            <NamespacePicklist
              onChange={getParamsUpdater('namespace')}
              value={params.namespace}
              clusterId={params.clusterId}
              disabled={!params.clusterId}
              showAll={false}
            />
          </>
        }
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

const options = {
  deleteFn: deployedAppActions.delete,
  deleteCond: ([selectedRow]) => selectedRow.status !== 'pending-install',
  editUrl: ({ clusterId, namespace, name }, id) =>
    routes.apps.deployed.edit.path({ clusterId, namespace, name }),
  editCond: ([selectedRow]) => selectedRow.status !== 'pending-install',
  columns: [
    { id: 'name', label: 'App Name' },
    { id: 'chart', label: 'App' },
    { id: 'chart_version', label: 'Version' },
  ],
  name: 'Deployed Apps',
  cacheKey: DataKeys.DeployedApps,
  title: 'Deployed Apps',
  uniqueIdentifier: 'name',
  multiSelection: false,
  searchTargets: ['name'],
  ListPage,
}

const { ListPage: DeployedAppsListPage } = createCRUDComponents(options)

export default DeployedAppsListPage
