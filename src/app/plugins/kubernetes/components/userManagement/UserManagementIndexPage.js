import React from 'react'
import Tabs from 'core/components/Tabs'
import Tab from 'core/components/Tab'
import TenantsListPage from 'k8s/components/userManagement/TenantsListPage'
import UsersListPage from 'k8s/components/userManagement/UsersListPage'

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
