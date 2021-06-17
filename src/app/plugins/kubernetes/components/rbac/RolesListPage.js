import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { roleActions } from './actions'
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
const usePrefParams = createUsePrefParamsHook('Roles', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(roleActions.list, params)
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
  addUrl: routes.rbac.addRoles.path(),
  addText: 'Add Role',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created', render: (value) => <DateCell value={value} /> },
  ],
  cacheKey: ActionDataKeys.KubeRoles,
  actions: roleActions,
  deleteFn: roleActions.delete,
  editUrl: (item, id) => routes.rbac.editRoles.path({ id, clusterId: item.clusterId }),
  name: 'Roles',
  title: 'Roles',
  ListPage,
}
const components = createCRUDComponents(options)
export const RolesList = components.List

export default components.ListPage
