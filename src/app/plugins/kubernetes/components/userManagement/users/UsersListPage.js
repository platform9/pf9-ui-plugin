import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { isSystemUser } from 'k8s/components/userManagement/users/actions'
import { pathJoin } from 'utils/misc'
import { k8sPrefix, listTablePrefs } from 'app/constants'
import SystemUsersToggle from 'k8s/components/userManagement/users/SystemUsersToggle'
import React, { useMemo } from 'react'
import useToggler from 'core/hooks/useToggler'
import useDataLoader from 'core/hooks/useDataLoader'
import { mngmUserActions } from './actions'
import { pick } from 'ramda'
import { createUsePrefParamsHook } from 'core/hooks/useParams'

const defaultParams = { systemUsers: true }
const usePrefParams = createUsePrefParamsHook('ManagementUsers', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const [showingSystemUsers, toggleSystemUsers] = useToggler()
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(mngmUserActions.list, params)
    const filteredRows = useMemo(
      () => data.filter(user => showingSystemUsers || !isSystemUser(user)),
      [data, showingSystemUsers])

    return <ListContainer
      loading={loading}
      reload={reload}
      data={filteredRows}
      getParamsUpdater={getParamsUpdater}
      extraToolbarContent={
        <SystemUsersToggle checked={showingSystemUsers} toggle={toggleSystemUsers} />}
      {...pick(listTablePrefs, params)}
    />
  }
}

export const options = {
  columns: [
    { id: 'id', label: 'OpenStack ID', display: false },
    { id: 'username', label: 'Username' },
    { id: 'displayname', label: 'Display Name' },
    { id: 'twoFactor', label: 'Two-Factor Authentication' },
    { id: 'tenantNames', label: 'Tenants' },
  ],
  addText: 'Create a new User',
  addUrl: pathJoin(k8sPrefix, 'user_management/users/add'),
  editUrl: pathJoin(k8sPrefix, 'user_management/users/edit'),
  name: 'Users',
  title: 'Users',
  uniqueIdentifier: 'id',
  searchTarget: 'username',
  multiSelection: false,
  ListPage,
}

const { ListPage: UsersListPage } = createCRUDComponents(options)

export default UsersListPage
