import React from 'react'
import UserManagementIndexPage from 'account/components/userManagement/UserManagementIndexPage'
import AddTenantPage from 'account/components/userManagement/tenants/AddTenantPage'
import EditTenantPage from 'account/components/userManagement/tenants/EditTenantPage'
import AddUserPage from 'account/components/userManagement/users/AddUserPage'
import EditUserPage from 'account/components/userManagement/users/EditUserPage'
import MyAccountHeader from 'account/components/secondaryHeaders/MyAccountHeader'
import { routes } from 'core/utils/routes'
import { AppPlugins, userAccountPrefix } from 'app/constants'
import UserSettingsIndexPage from './components/user-settings/user-settings-index-page'

class MyAccount extends React.PureComponent {
  render() {
    return <h1>Account Plugin</h1>
  }
}

MyAccount.__name__ = AppPlugins.MyAccount

MyAccount.registerPlugin = (pluginManager) => {
  const plugin = pluginManager.registerPlugin(AppPlugins.MyAccount, 'Account', userAccountPrefix)

  plugin.registerSecondaryHeader(MyAccountHeader)

  plugin.registerRoutes([
    {
      name: 'User Settings',
      link: {
        path: routes.userSettings.root.toString(userAccountPrefix),
        exact: true,
        default: true,
      },
      component: UserSettingsIndexPage,
    },
    {
      name: 'Tenants & Users',
      requiredRoles: 'admin',
      link: {
        path: routes.userManagement.root.toString(userAccountPrefix),
        exact: true,
        default: true,
      },
      component: UserManagementIndexPage,
    },
    {
      name: 'Add Tenant',
      requiredRoles: 'admin',
      link: { path: routes.userManagement.addTenant.toString(userAccountPrefix), exact: true },
      component: AddTenantPage,
    },
    {
      name: 'Edit Tenant',
      requiredRoles: 'admin',
      link: { path: routes.userManagement.editTenant.toString(userAccountPrefix), exact: true },
      component: EditTenantPage,
    },
    {
      name: 'Add User',
      requiredRoles: 'admin',
      link: { path: routes.userManagement.addUser.toString(userAccountPrefix), exact: true },
      component: AddUserPage,
    },
    {
      name: 'Edit User',
      requiredRoles: 'admin',
      link: { path: routes.userManagement.editUser.toString(userAccountPrefix), exact: true },
      component: EditUserPage,
    },
  ])

  // These nav items are in active development but not shown in production.
  const navItems = [
    {
      name: 'User Settings',
      link: { path: routes.userSettings.root.toString(userAccountPrefix) },
      icon: 'user',
    },
    {
      name: 'Tenants & Users',
      link: { path: routes.userManagement.root.toString(userAccountPrefix) },
      icon: 'building',
      requiredRoles: 'admin',
      nestedLinks: [
        {
          name: 'Tenants',
          link: { path: routes.userManagement.tenants.toString(userAccountPrefix) },
        },
        {
          name: 'Users',
          link: { path: routes.userManagement.users.toString(userAccountPrefix) },
        },
        { name: 'Groups', link: { path: '/user_management#userGroups' } },
        { name: 'Roles', link: { path: '/user_management#roles' } },
      ],
    },
  ]

  plugin.registerNavItems(navItems)
}

export default MyAccount
