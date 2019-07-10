import React from 'react'
import Tabs from 'core/components/Tabs'
import Tab from 'core/components/Tab'
import TenantsListPage from 'k8s/components/userManagement/TenantsListPage'
import UsersListPage from 'k8s/components/userManagement/UsersListPage'
import UserGroupsListPage from 'k8s/components/userManagement/UserGroupsListPage'
import UserRolesListPage from 'k8s/components/userManagement/UserRolesListPage'

const UserManagementIndexPage = () => (
  <Tabs>
    <Tab value="tenants" label="Tenants"><TenantsListPage /></Tab>
    <Tab value="users" label="Users"><UsersListPage /></Tab>
    <Tab value="userGroups" label="Groups"><UserGroupsListPage /></Tab>
    <Tab value="roles" label="Roles"><UserRolesListPage /></Tab>
  </Tabs>
)

export default UserManagementIndexPage
