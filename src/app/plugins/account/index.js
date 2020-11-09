import React from 'react'
import UserManagementIndexPage from 'account/components/userManagement/UserManagementIndexPage'
import AddTenantPage from 'account/components/userManagement/tenants/AddTenantPage'
import EditTenantPage from 'account/components/userManagement/tenants/EditTenantPage'
import AddUserPage from 'account/components/userManagement/users/AddUserPage'
import EditUserPage from 'account/components/userManagement/users/EditUserPage'
import MyAccountHeader from 'account/components/secondHeader/MyAccountHeader'
import { routes } from 'core/utils/routes'

const myAccountPrefix = '/ui/my-account'

class MyAccount extends React.PureComponent {
  render() {
    return <h1>Account Plugin</h1>
  }
}

MyAccount.__name__ = 'account'

MyAccount.registerPlugin = (pluginManager) => {
  const plugin = pluginManager.registerPlugin('account', 'Account', myAccountPrefix)

  plugin.registerSecondHeader(MyAccountHeader)

  plugin.registerRoutes([
    {
      name: 'Tenants & Users',
      requiredRoles: 'admin',
      link: {
        path: routes.userManagement.root.toString(true, myAccountPrefix),
        exact: true,
        default: true,
      },
      component: UserManagementIndexPage,
    },
    {
      name: 'Add Tenant',
      requiredRoles: 'admin',
      link: { path: routes.userManagement.addTenant.toString(true, myAccountPrefix), exact: true },
      component: AddTenantPage,
    },
    {
      name: 'Edit Tenant',
      requiredRoles: 'admin',
      link: { path: routes.userManagement.editTenant.toString(true, myAccountPrefix), exact: true },
      component: EditTenantPage,
    },
    {
      name: 'Add User',
      requiredRoles: 'admin',
      link: { path: routes.userManagement.addUser.toString(true, myAccountPrefix), exact: true },
      component: AddUserPage,
    },
    {
      name: 'Edit User',
      requiredRoles: 'admin',
      link: { path: routes.userManagement.editUser.toString(true, myAccountPrefix), exact: true },
      component: EditUserPage,
    },
  ])

  // These nav items are in active development but not shown in production.
  const navItems = [
    {
      name: 'Tenants & Users',
      link: { path: routes.userManagement.root.toString(true, myAccountPrefix) },
      icon: 'user',
      requiredRoles: 'admin',
      nestedLinks: [
        {
          name: 'Tenants',
          link: { path: routes.userManagement.tenants.toString(true, myAccountPrefix) },
        },
        {
          name: 'Users',
          link: { path: routes.userManagement.users.toString(true, myAccountPrefix) },
        },
        { name: 'Groups', link: { path: '/user_management#userGroups' } },
        { name: 'Roles', link: { path: '/user_management#roles' } },
      ],
    },
  ]

  plugin.registerNavItems(navItems)
}

export default MyAccount
