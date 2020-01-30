import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import TenantsListPage from 'k8s/components/userManagement/tenants/TenantsListPage'
import UsersListPage from 'k8s/components/userManagement/users/UsersListPage'
import UserRolesListPage from 'k8s/components/userManagement/roles/UserRolesListPage'
import PageContainer from 'core/components/pageContainer/PageContainer'

const UserManagementIndexPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="tenants" label="Tenants"><TenantsListPage /></Tab>
      <Tab value="users" label="Users"><UsersListPage /></Tab>
      {/* <Tab value="userGroups" label="Groups"><UserGroupsListPage /></Tab> */}
      <Tab value="roles" label="Roles"><UserRolesListPage /></Tab>
    </Tabs>
  </PageContainer>
)

export default UserManagementIndexPage
