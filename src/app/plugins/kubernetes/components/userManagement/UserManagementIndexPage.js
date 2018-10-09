import React from 'react'
import Tabs from 'core/common/Tabs'
import Tab from 'core/common/Tab'

const TenantsListPage = () => <h1>TODO: Tenants List Page</h1>
const UsersListPage = () => <h1>TODO: Users List Page</h1>
const UserGroupsListPage = () => <h1>TODO: User Groups List Page</h1>
const RolesListPage = () => <h1>TODO: Roles List Page</h1>

const UserManagementIndexPage = () => (
  <Tabs>
    <Tab value="tenants" label="Tenants"><TenantsListPage /></Tab>
    <Tab value="users" label="Users"><UsersListPage /></Tab>
    <Tab value="userGroups" label="Groups"><UserGroupsListPage /></Tab>
    <Tab value="roles" label="Roles"><RolesListPage /></Tab>
  </Tabs>
)

export default UserManagementIndexPage
