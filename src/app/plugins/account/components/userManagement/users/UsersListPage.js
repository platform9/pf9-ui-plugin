import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { isSystemUser } from 'account/components/userManagement/users/actions'
import { pathJoin } from 'utils/misc'
import { userAccountPrefix, listTablePrefs } from 'app/constants'
import SystemUsersToggle from 'account/components/userManagement/users/SystemUsersToggle'
import React, { useMemo } from 'react'
import useToggler from 'core/hooks/useToggler'
import useDataLoader from 'core/hooks/useDataLoader'
import { mngmUserActions } from './actions'
import { pipe, pluck, join, pick } from 'ramda'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { arrayIfNil } from 'utils/fp'

const defaultParams = { systemUsers: true }
const usePrefParams = createUsePrefParamsHook('ManagementUsers', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const [showingSystemUsers, toggleSystemUsers] = useToggler()
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(mngmUserActions.list, params)

    const filteredRows = useMemo(
      () => data.filter((user) => showingSystemUsers || !isSystemUser(user)),
      [data, showingSystemUsers],
    )
    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={filteredRows}
        getParamsUpdater={getParamsUpdater}
        extraToolbarContent={
          <SystemUsersToggle checked={showingSystemUsers} toggle={toggleSystemUsers} />
        }
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

export const options = {
  columns: [
    { id: 'id', label: 'User Uuid', display: false },
    { id: 'username', label: 'Username' },
    { id: 'displayname', label: 'Display Name' },
    { id: 'twoFactor', label: 'Two-Factor Authentication' },
    { id: 'tenants', label: 'Tenants', render: pipe(arrayIfNil, pluck('name'), join(', ')) },
  ],
  addText: 'Create a new User',
  addUrl: pathJoin(userAccountPrefix, 'user_management/users/add'),
  deleteFn: mngmUserActions.delete,
  editUrl: pathJoin(userAccountPrefix, 'user_management/users/edit'),
  name: 'Users',
  title: 'Users',
  uniqueIdentifier: 'id',
  searchTarget: 'username',
  nameProp: 'username',
  multiSelection: false,
  ListPage,
}

const { ListPage: UsersListPage } = createCRUDComponents(options)

export default UsersListPage
