import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterRoleBindingActions } from './actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import { pick } from 'ramda'
import DateCell from 'core/components/listTable/cells/DateCell'
import { ActionDataKeys } from 'k8s/DataKeys'
import { routes } from 'core/utils/routes'

const defaultParams = {
  masterNodeClusters: true,
  clusterId: allKey,
}
const usePrefParams = createUsePrefParamsHook('ClusterRoleBindings', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(clusterRoleBindingActions.list, params)
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
  addUrl: routes.rbac.addClusterRoleBindings.path(),
  addText: 'Add Cluster Role Binding',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created', render: (value) => <DateCell value={value} /> },
  ],
  cacheKey: ActionDataKeys.ClusterRoleBindings,
  deleteFn: clusterRoleBindingActions.delete,
  editUrl: (item, id) =>
    routes.rbac.editClusterRoleBindings.path({ id, clusterId: item.clusterId }),
  name: 'Cluster Role Bindings',
  title: 'Cluster Role Bindings',
  ListPage,
}
const components = createCRUDComponents(options)
export const ClusterRoleBindingsList = components.List

export default components.ListPage
