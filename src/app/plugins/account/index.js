import React from 'react'
import UserManagementIndexPage from 'account/components/userManagement/UserManagementIndexPage'
import AddTenantPage from 'account/components/userManagement/tenants/AddTenantPage'
import EditTenantPage from 'account/components/userManagement/tenants/EditTenantPage'
import AddUserPage from 'account/components/userManagement/users/AddUserPage'
import EditUserPage from 'account/components/userManagement/users/EditUserPage'
import MyAccountHeader from 'account/components/secondHeader/MyAccountHeader'

class Account extends React.PureComponent {
  render() {
    return <h1>Account Plugin</h1>
  }
}

Account.__name__ = 'account'

Account.registerPlugin = (pluginManager) => {
  const plugin = pluginManager.registerPlugin('account', 'Account', '/ui/account')

  plugin.registerSecondHeader(MyAccountHeader)

  plugin.registerRoutes([
    {
      name: 'Tenants & Users',
      requiredRoles: 'admin',
      link: { path: '/user_management', exact: true, default: true },
      component: UserManagementIndexPage,
    },
    {
      name: 'Add Tenant',
      requiredRoles: 'admin',
      link: { path: '/user_management/tenants/add', exact: true },
      component: AddTenantPage,
    },
    {
      name: 'Edit Tenant',
      requiredRoles: 'admin',
      link: { path: '/user_management/tenants/edit/:id', exact: true },
      component: EditTenantPage,
    },
    {
      name: 'Add User',
      requiredRoles: 'admin',
      link: { path: '/user_management/users/add', exact: true },
      component: AddUserPage,
    },
    {
      name: 'Edit User',
      requiredRoles: 'admin',
      link: { path: '/user_management/users/edit/:id', exact: true },
      component: EditUserPage,
    },
  ])

  const hostPrefix = '' // set to another host during development

  // These nav items are in active development but not shown in production.
  const navItems = [
    {
      name: 'Tenants & Users',
      link: { path: '/user_management' },
      icon: 'user',
      requiredRoles: 'admin',
      nestedLinks: [
        { name: 'Tenants', link: { path: '/user_management#tenants' } },
        { name: 'Users', link: { path: '/user_management#users' } },
        { name: 'Groups', link: { path: '/user_management#userGroups' } },
        { name: 'Roles', link: { path: '/user_management#roles' } },
      ],
    },
  ]

  plugin.registerNavItems(navItems)
}

export default Account
