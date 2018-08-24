import React from 'react'

import DashboardPage from './components/DashboardPage'

import AddTenantPage from './components/tenants/AddTenantPage'
import TenantsListPage from './components/tenants/TenantsListPage'

import UsersListPage from './components/users/UsersListPage'
import AddUserPage from './components/users/AddUserPage'
import UpdateUserPage from './components/users/UpdateUserPage'

import FlavorsListPage from './components/flavors/FlavorsListPage'
import AddFlavorPage from './components/flavors/AddFlavorPage'
import UpdateFlavorPage from './components/flavors/UpdateFlavorPage'

import NetworksPage from './components/networks/NetworksListPage'
import AddNetworkPage from './components/networks/AddNetworkPage'
import UpdateNetworkPage from './components/networks/UpdateNetworkPage'

import RoutersPage from './components/routers/RoutersListPage'
import AddRouterPage from './components/routers/AddRouterPage'
import UpdateRouterPage from './components/routers/UpdateRouterPage'

import FloatingIpsPage from './components/floatingips/FloatingIpsListPage'
import AddFloatingIpPage from './components/floatingips/AddFloatingIpPage'
import UpdateFloatingIpPage from './components/floatingips/UpdateFloatingIpPage'

import StorageIndex from './components/volumes/StorageIndex'
import VolumesListPage from './components/volumes/VolumesListPage'
import AddVolumePage from './components/volumes/AddVolumePage'
import UpdateVolumePage from './components/volumes/UpdateVolumePage'

// import AddVolumeTypePage from './components/volumes/AddVolumeTypePage'

import GlanceImageIndex from './components/glanceimages/GlanceImageIndex'
import GlanceImageListPage from './components/glanceimages/GlanceImageListPage'
import AddGlanceImagePage from './components/glanceimages/AddGlanceImagePage'
import UpdateGlanceImagePage from './components/glanceimages/UpdateGlanceImagePage'

import ApiAccessPage from './components/api-access/ApiAccessListPage'

import ApplicationsPage from './components/applications/ApplicationsListPage'

import SshKeysPage from './components/sshkeys/SshKeysListPage'
import AddSshKeyPage from './components/sshkeys/AddSshKeyPage'

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
        name: 'EditFlavor',
        link: { path: '/flavors/edit/:flavorId', exact: true },
        component: UpdateFlavorPage
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
        name: 'EditNetwork',
        link: { path: '/networks/edit/:networkId', exact: true },
        component: UpdateNetworkPage
      },
      {
        name: 'Routers',
        link: { path: '/routers', exact: true },
        component: RoutersPage
      },
      {
        name: 'AddRouter',
        link: { path: '/routers/add' },
        component: AddRouterPage
      },
      {
        name: 'EditRouter',
        link: { path: '/routers/edit/:routerId', exact: true },
        component: UpdateRouterPage
      },
      {
        name: 'FloatingIps',
        link: { path: '/floatingips', exact: true },
        component: FloatingIpsPage
      },
      {
        name: 'AddFloatingIp',
        link: { path: '/floatingips/add' },
        component: AddFloatingIpPage
      },
      {
        name: 'EditFloatingIp',
        link: { path: '/floatingips/edit/:floatingIpId', exact: true },
        component: UpdateFloatingIpPage
      },
      {
        name: 'ApiAccess',
        link: { path: '/apiaccess' },
        component: ApiAccessPage
      },
      {
        name: 'storage',
        link: { path: '/storage', exact: true },
        component: StorageIndex
      },
      {
        name: 'Volumes',
        link: { path: '/storage#volumes', exact: true },
        component: VolumesListPage
      },
      {
        name: 'AddVolume',
        link: { path: '/storage/volumes/add', exact: true },
        component: AddVolumePage
      },
      {
        name: 'EditVolume',
        link: { path: '/storage/volumes/edit/:volumeId', exact: true },
        component: UpdateVolumePage
      },
      /*
      {
        name: 'AddVolumeType',
        link: { path: '/storage/volumeTypes/add', exact: true },
        component: AddVolumeTypePage
      },
      */
      {
        name: 'GlanceImages',
        link: { path: '/glanceimages', exact: true },
        component: GlanceImageIndex
      },
      {
        name: 'GlanceImagesList',
        link: { path: '/glanceimages#images', exact: true },
        component: GlanceImageListPage
      },
      {
        name: 'AddGlanceImages',
        link: { path: '/glanceimages/add', exact: true },
        component: AddGlanceImagePage
      },
      {
        name: 'EditGlanceImage',
        link: { path: '/glanceimages/edit/:glanceImageId', exact: true },
        component: UpdateGlanceImagePage
      },
      {
        name: 'Applications',
        link: { path: '/applications', exact: true },
        component: ApplicationsPage
      },
      {
        name: 'SshKeys',
        link: { path: '/sshkeys', exact: true },
        component: SshKeysPage
      },
      {
        name: 'AddSshKey',
        link: { path: '/sshkeys/add', exact: true },
        component: AddSshKeyPage
      },
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
        name: 'Routers',
        link: { path: '/routers' }
      },
      {
        name: 'Floating IPs',
        link: { path: '/floatingips' }
      },
      {
        name: 'API Access',
        link: { path: '/apiaccess' },
      },
      {
        name: 'Volumes',
        link: { path: '/storage' },
      },
      {
        name: 'Glance Images',
        link: { path: '/glanceimages' }
      },
      {
        name: 'Applications',
        link: { path: '/applications' }
      },
      {
        name: 'SSH Keys',
        link: { path: '/sshkeys' }
      }
    ]
  )

  pluginManager.registerSchema(openstackSchemas)
}

export default OpenStack
