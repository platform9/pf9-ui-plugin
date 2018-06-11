import React from 'react'
import { combineReducers } from 'redux'

import DashboardPage from './components/DashboardPage'
import LoginPage from './components/LoginPage'

import AddTenantPage from './components/tenants/AddTenantPage'
import TenantsListPage from './components/tenants/TenantsListPage'

import UsersListPage from './components/users/UsersListPage'
import AddUserPage from './components/users/AddUserPage'
import UpdateUserPage from './components/users/UpdateUserPage'

import FlavorsListPage from './components/flavors/FlavorsListPage'
import AddFlavorPage from './components/flavors/AddFlavorPage'

import NetworksPage from './components/NetworksPage'
import AddNetworkPage from './components/networks/AddNetworkPage'

import VolumesListPage from './components/volumes/VolumesListPage'
import AddVolumePage from './components/volumes/AddVolumePage'

import ApiAccessPage from './components/api-access/ApiAccessListPage'

import loginReducer from './reducers/login'
import sessionReducer from './reducers/session'
import tenantsReducer from './reducers/tenants'
import usersReducer from './reducers/users'
import flavorsReducer from './reducers/flavors'
import networksReducer from './reducers/networks'

import openstackSchemas from 'schema/openstack'

class OpenStack extends React.Component {
  render () {
    return (
      <h1>OpenStack Plugin</h1>
    )
  }
}

OpenStack.__name__ = 'openstack'

OpenStack.registerPlugin = pluginManager => {
  pluginManager.registerRoutes(
    '/ui/openstack',
    [
      {
        name: 'Dashboard',
        link: { path: '/', exact: true, default: true },
        component: DashboardPage
      },
      {
        name: 'Login',
        link: { path: '/login' },
        component: LoginPage
      },
      {
        name: 'Tenants',
        link: { path: '/tenants', exact: true },
        component: TenantsListPage
      },
      {
        name: 'AddTenant',
        link: { path: '/tenants/add' },
        component: AddTenantPage
      },
      {
        name: 'Users',
        link: { path: '/users', exact: true },
        component: UsersListPage
      },
      {
        name: 'AddUser',
        link: { path: '/users/add' },
        component: AddUserPage
      },
      {
        name: 'EditUser',
        link: { path: '/users/edit/:userId' },
        component: UpdateUserPage
      },
      {
        name: 'Flavors',
        link: { path: '/flavors', exact: true },
        component: FlavorsListPage
      },
      {
        name: 'AddFlavor',
        link: { path: '/flavors/add' },
        component: AddFlavorPage
      },
      {
        name: 'Networks',
        link: { path: '/networks', exact: true },
        component: NetworksPage
      },
      {
        name: 'AddNetwork',
        link: { path: '/networks/add' },
        component: AddNetworkPage
      },
      {
        name: 'ApiAccess',
        link: { path: '/apiaccess' },
        component: ApiAccessPage
      },
      {
        name: 'Volumes',
        link: { path: '/volumes', exact: true },
        component: VolumesListPage
      },
      {
        name: 'AddVolume',
        link: { path: '/volumes/add', exact: true },
        component: AddVolumePage
      }
    ]
  )

  pluginManager.registerNavItems(
    '/ui/openstack',
    [
      {
        name: 'Dashboard',
        link: { path: '/' }
      },
      {
        name: 'Tenants',
        link: { path: '/tenants' }
      },
      {
        name: 'Users',
        link: { path: '/users' }
      },
      {
        name: 'Flavors',
        link: { path: '/flavors' }
      },
      {
        name: 'Networks',
        link: { path: '/networks' }
      },
      {
        name: 'API Access',
        link: { path: '/apiaccess' },
      },
      {
        name: 'Volumes',
        link: { path: '/volumes' },
      },
    ]
  )

  pluginManager.registerSchema(openstackSchemas)
}

OpenStack.reducer = combineReducers({
  login: loginReducer,
  session: sessionReducer,
  tenants: tenantsReducer,
  users: usersReducer,
  flavors: flavorsReducer,
  networks: networksReducer,
})

export default OpenStack
