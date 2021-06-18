import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { routes } from 'core/utils/routes'
import { ActionDataKeys } from 'k8s/DataKeys'
import { rbacProfilesActions } from './actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { listTablePrefs } from 'app/constants'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { pick } from 'ramda'
import useScopedPreferences from 'core/session/useScopedPreferences'

const defaultParams = {
  orderBy: 'name',
  orderDirection: 'asc',
}
const usePrefParams = createUsePrefParamsHook('RbacProfiles', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [{ currentTenant }] = useScopedPreferences()
    const [data, loading, reload] = useDataLoader(rbacProfilesActions.list, {
      ...params,
      namespace: currentTenant,
    })
    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={data}
        getParamsUpdater={getParamsUpdater}
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

export const options = {
  addUrl: routes.rbac.profiles.add.path(),
  addText: 'Add RBAC Profile',
  columns: [
    { id: 'metadata.name', label: 'Name' },
    { id: 'status.phase', label: 'Status' },
    { id: 'metadata.uid', label: 'Unique ID' },
  ],
  cacheKey: ActionDataKeys.RbacProfiles,
  editUrl: (_, id) => routes.rbac.profiles.edit.path({ id }),
  editCond: ([selectedRow]) => selectedRow.status === 'published',
  name: 'RbacProfiles',
  // profiles actions file needs to be imported & used somewhere
  // loaderFn: rbacProfilesActions.list,
  title: 'RBAC Profiles',
  uniqueIdentifier: 'id',
  searchTargets: ['name', 'id'],
  multiSelection: false,
  ListPage,
}

const components = createCRUDComponents(options)
export default components.ListPage
