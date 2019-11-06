import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterRoleBindingsCacheKey, clusterRoleBindingActions } from './actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'
import { pick } from 'ramda'

const defaultParams = {
  masterNodeClusters: true,
}
const usePrefParams = createUsePrefParamsHook('ClusterRoleBindings', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(clusterRoleBindingActions.list, params)
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
  addUrl: '/ui/kubernetes/rbac/clusterrolebindings/add',
  addText: 'Add Cluster Role Binding',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  cacheKey: clusterRoleBindingsCacheKey,
  deleteFn: clusterRoleBindingActions.delete,
  name: 'Cluster Role Bindings',
  title: 'Cluster Role Bindings',
  ListPage,
}
const components = createCRUDComponents(options)
export const ClusterRoleBindingsList = components.List

export default components.ListPage
