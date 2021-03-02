import { listTablePrefs } from 'app/constants'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import useDataLoader from 'core/hooks/useDataLoader'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { pick } from 'ramda'
import React from 'react'
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

    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={releases}
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
  columns: [
    { id: 'name', label: 'App Name' },
    { id: 'app', label: 'App' },
    { id: 'version', label: 'Version' },
  ],
  name: 'Deployed Apps',
  title: 'Deployed Apps',
  ListPage,
}

const { ListPage: DeployedAppsListPage } = createCRUDComponents(options)

export default DeployedAppsListPage
