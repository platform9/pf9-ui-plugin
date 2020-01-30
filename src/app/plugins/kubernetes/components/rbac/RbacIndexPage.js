import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import RolesListPage from './RolesListPage'
import ClusterRolesListPage from './ClusterRolesListPage'
import RoleBindingsListPage from './RoleBindingsListPage'
import ClusterRoleBindingsListPage from './ClusterRoleBindingsListPage'
import PageContainer from 'core/components/pageContainer/PageContainer'

const RbacIndexPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="roles" label="Roles"><RolesListPage /></Tab>
      <Tab value="clusterRoles" label="Cluster Roles"><ClusterRolesListPage /></Tab>
      <Tab value="roleBindings" label="Role Bindings"><RoleBindingsListPage /></Tab>
      <Tab value="clusterRoleBindings" label="Cluster Role Bindings"><ClusterRoleBindingsListPage /></Tab>
    </Tabs>
  </PageContainer>
)

export default RbacIndexPage
