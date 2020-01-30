import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { roleBindingsCacheKey, roleBindingActions } from './actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'
import { pick } from 'ramda'

const defaultParams = {}
const usePrefParams = createUsePrefParamsHook('RoleBindings', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(roleBindingActions.list, params)
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
  addUrl: '/ui/kubernetes/rbac/rolebindings/add',
  addText: 'Add Role Binding',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  cacheKey: roleBindingsCacheKey,
  deleteFn: roleBindingActions.delete,
  editUrl: '/ui/kubernetes/rbac/rolebindings/edit',
  customEditUrlFn: (item, itemId) => (
    `/ui/kubernetes/rbac/rolebindings/edit/${itemId}/cluster/${item.clusterId}`
  ),
  name: 'RoleBindings',
  title: 'RoleBindings',
  ListPage,
}
const components = createCRUDComponents(options)
export const RoleBindingsList = components.List

export default components.ListPage
