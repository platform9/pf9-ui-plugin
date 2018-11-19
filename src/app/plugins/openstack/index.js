import React from 'react'

import DashboardPage from './components/DashboardPage'

import AddTenantPage from './components/tenants/AddTenantPage'
import TenantsListPage from './components/tenants/TenantsListPage'

import UsersListPage from './components/users/UsersListPage'
import AddUserPage from './components/users/AddUserPage'
import UpdateUserPage from './components/users/UpdateUserPage'

import FlavorsListPage from './components/flavors/FlavorsListPage'
import AddFlavorPage from './components/flavors/AddFlavorPage'

import InstancesPage from './components/instances/InstancesListPage'

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

import AddVolumeTypePage from './components/volumes/AddVolumeTypePage'
import UpdateVolumeTypePage from './components/volumes/UpdateVolumeTypePage'

import CreateSnapshotPage from './components/volumes/CreateSnapshotPage'
import VolumeSnapshotsListPage from './components/volumes/VolumeSnapshotsListPage'
import UpdateVolumeSnapshotPage from './components/volumes/UpdateVolumeSnapshotPage'

import HostsListPage from './components/hosts/HostsListPage'

import ImageIndex from './components/images/ImageIndex'
import ImageListPage from './components/images/ImageListPage'
import AddImagePage from './components/images/AddImagePage'
import UpdateImagePage from './components/images/UpdateImagePage'

import ApiAccessPage from './components/api-access/ApiAccessListPage'

import ApplicationsPage from './components/applications/ApplicationsListPage'

import SshKeysPage from './components/sshkeys/SshKeysListPage'
import AddSshKeyPage from './components/sshkeys/AddSshKeyPage'

class OpenStack extends React.Component {
  render () {
    return (
      <h1>OpenStack Plugin</h1>
    )
  }
}

OpenStack.__name__ = 'openstack'

OpenStack.registerPlugin = pluginManager => {
  const plugin = pluginManager.registerPlugin(
    'openstack', 'OpenStack', '/ui/openstack'
  )

  plugin.registerRoutes(
    [
      {
        name: 'Dashboard',
        link: { path: '/', exact: true, default: false },
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
        name: 'Instances',
        link: { path: '/instances', exact: true },
        component: InstancesPage
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
      {
        name: 'AddVolumeType',
        link: { path: '/storage/volumeTypes/add', exact: true },
        component: AddVolumeTypePage
      },
      {
        name: 'EditVolumeType',
        link: { path: '/storage/volumeTypes/edit/:volumeTypeId', exact: true },
        component: UpdateVolumeTypePage
      },
      {
        name: 'CreateSnapshot',
        link: { path: '/storage/volumes/snapshot/:volumeId', exact: true },
        component: CreateSnapshotPage
      },
      {
        name: 'VolumeSnapshots',
        link: { path: '/storage#volumeSnapshots', exact: true },
        component: VolumeSnapshotsListPage
      },
      {
        name: 'EditVolumeSnapshot',
        link: { path: '/storage/volumeSnapshots/edit/:volumeSnapshotId', exact: true },
        component: UpdateVolumeSnapshotPage
      },
      {
        name: 'Images',
        link: { path: '/images', exact: true },
        component: ImageIndex
      },
      {
        name: 'ImagesList',
        link: { path: '/images#images', exact: true },
        component: ImageListPage
      },
      {
        name: 'AddImages',
        link: { path: '/images/add', exact: true },
        component: AddImagePage
      },
      {
        name: 'EditImage',
        link: { path: '/images/edit/:imageId', exact: true },
        component: UpdateImagePage
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
      {
        name: 'Hosts',
        link: { path: '/hosts', exact: true },
        component: HostsListPage
      }
    ]
  )

  plugin.registerNavItems(
    [
      /* Comment out the nav items since first UI release will be K8s only
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
        name: 'Instances',
        link: { path: '/instances' }
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
        name: 'Images',
        link: { path: '/images' }
      },
      {
        name: 'Applications',
        link: { path: '/applications' }
      },
      {
        name: 'SSH Keys',
        link: { path: '/sshkeys' }
      },
      {
        name: 'Hosts',
        link: { path: '/hosts' }
      }
      /**/
    ]
  )
}

export default OpenStack
