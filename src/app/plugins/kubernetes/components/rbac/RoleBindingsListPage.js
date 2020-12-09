import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { roleBindingActions } from './actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import { pick } from 'ramda'
import DateCell from 'core/components/listTable/cells/DateCell'
import { ActionDataKeys } from 'k8s/DataKeys'

const defaultParams = {
  clusterId: allKey,
}
const usePrefParams = createUsePrefParamsHook('RoleBindings', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(roleBindingActions.list, params)
    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={data}
        getParamsUpdater={getParamsUpdater}
        filters={
          <ClusterPicklist
            selectFirst={false}
            onChange={getParamsUpdater('clusterId')}
            value={params.clusterId}
            onlyMasterNodeClusters
          />
        }
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

export const options = {
  addUrl: '/ui/kubernetes/rbac/rolebindings/add',
  addText: 'Add Role Binding',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created', render: (value) => <DateCell value={value} /> },
  ],
  cacheKey: ActionDataKeys.RoleBindings,
  deleteFn: roleBindingActions.delete,
  editUrl: (item, itemId) =>
    `/ui/kubernetes/rbac/rolebindings/edit/${itemId}/cluster/${item.clusterId}`,
  name: 'RoleBindings',
  title: 'RoleBindings',
  ListPage,
}
const components = createCRUDComponents(options)
export const RoleBindingsList = components.List

export default components.ListPage
