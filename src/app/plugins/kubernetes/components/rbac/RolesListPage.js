import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { roleActions, rolesCacheKey } from './actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'
import { pick } from 'ramda'

const defaultParams = {
  masterNodeClusters: true,
}
const usePrefParams = createUsePrefParamsHook('Roles', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(roleActions.list, params)
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
  addUrl: '/ui/kubernetes/rbac/roles/add',
  addText: 'Add Role',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  cacheKey: rolesCacheKey,
  deleteFn: roleActions.delete,
  editUrl: '/ui/kubernetes/rbac/roles/edit',
  customEditUrlFn: (item, itemId) => (
    `/ui/kubernetes/rbac/roles/edit/${itemId}/cluster/${item.clusterId}`
  ),
  name: 'Roles',
  title: 'Roles',
  ListPage,
}
const components = createCRUDComponents(options)
export const RolesList = components.List

export default components.ListPage
