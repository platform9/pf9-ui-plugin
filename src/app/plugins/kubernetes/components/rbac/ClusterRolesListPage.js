import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterRolesCacheKey, clusterRoleActions } from './actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'
import { pick } from 'ramda'

const defaultParams = {
  masterNodeClusters: true,
}
const usePrefParams = createUsePrefParamsHook('ClusterRoles', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(clusterRoleActions.list, params)
    return <ListContainer
      loading={loading}
      reload={reload}
      data={data}
      getParamsUpdater={getParamsUpdater}
      filters={<ClusterPicklist
        onChange={getParamsUpdater('clusterId')}
        value={params.clusterId}
        onlyMasterNodeClusters
      />}
      {...pick(listTablePrefs, params)}
    />
  }
}

export const options = {
  addUrl: '/ui/kubernetes/rbac/clusterroles/add',
  addText: 'Add Cluster Role',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  cacheKey: clusterRolesCacheKey,
  deleteFn: clusterRoleActions.delete,
  name: 'Cluster Roles',
  title: 'Cluster Roles',
  ListPage,
}
const components = createCRUDComponents(options)
export const ClusterRolesList = components.List

export default components.ListPage
