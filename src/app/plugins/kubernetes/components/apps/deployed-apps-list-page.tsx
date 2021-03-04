import { listTablePrefs } from 'app/constants'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import useDataLoader from 'core/hooks/useDataLoader'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { routes } from 'core/utils/routes'
import DataKeys from 'k8s/DataKeys'
import { pick } from 'ramda'
import React, { useMemo } from 'react'
import ClusterPicklistDefault from '../common/ClusterPicklist'
import NamespacePicklistDefault from '../common/NamespacePicklist'
import { releaseActions } from './actions'
const ClusterPicklist: any = ClusterPicklistDefault
const NamespacePicklist: any = NamespacePicklistDefault

const defaultParams = {
  masterNodeClusters: true,
}
const usePrefParams = createUsePrefParamsHook('Deployed Apps', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [releases, loading, reload] = useDataLoader(releaseActions.list, {
      namespace: params.namespace,
      clusterId: params.clusterId,
    })

    const filteredReleases = useMemo(
      () => releases.filter((release) => release.status === 'deployed'),
      [releases],
    )

    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={filteredReleases}
        getParamsUpdater={getParamsUpdater}
        filters={
          <>
            <ClusterPicklist
              onChange={getParamsUpdater('clusterId')}
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
  deleteFn: releaseActions.delete,
  editUrl: ({ clusterId, namespace, name }, id) =>
    routes.apps.deployed.edit.path({ clusterId, namespace, name }),
  columns: [
    { id: 'name', label: 'App Name' },
    { id: 'chart', label: 'App' },
    { id: 'chart_version', label: 'Version' },
  ],
  name: 'Deployed Apps',
  cacheKey: DataKeys.Deployments,
  uniqueIdentifier: 'name',
  title: 'Deployed Apps',
  multiSelection: false,
  searchTarget: 'name',
  ListPage,
}

const { ListPage: DeployedAppsListPage } = createCRUDComponents(options)

export default DeployedAppsListPage
