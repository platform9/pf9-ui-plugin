/* eslint-disable no-unused-vars, no-undef */
import context from '../context'
import Region from '../models/openstack/Region'
import Role from '../models/openstack/Role'
import Group from '../models/openstack/Group'
import Tenant from '../models/openstack/Tenant'
import TenantUser from '../models/openstack/TenantUser'
import User from '../models/openstack/User'
import Flavor from '../models/openstack/Flavor'
import Instance from '../models/openstack/Instance'
import Network from '../models/openstack/Network'
import Router from '../models/openstack/Router'
import FloatingIp from '../models/openstack/FloatingIp'
import Volume from '../models/openstack/Volume'
import Image from '../models/openstack/Image'
import Application from '../models/openstack/Application'
import SshKey from '../models/openstack/SshKey'
import Hypervisor from '../models/openstack/Hypervisor'
import ResMgrHost from '../models/resmgr/ResMgrHost'
import CloudProvider from '../models/qbert/CloudProvider'
import Node from '../models/qbert/Node'
import Cluster from '../models/qbert/Cluster'
import Namespace from '../models/qbert/Namespace'
import Pod from '../models/qbert/Pod'
import Deployment from '../models/qbert/Deployment'
import Service from '../models/qbert/Service'
import Chart from '../models/monocular/Chart'
import ChartVersion from '../models/monocular/ChartVersion'
import Release from '../models/monocular/Release'
import Repository from '../models/monocular/Repository'
import StorageClass from '../models/qbert/StorageClass'
import ClusterRepository from '../models/qbert/Repository'
import PrometheusInstance from '../models/prometheus/PrometheusInstance'
import { attachNodeToCluster } from '../models/qbert/Operations'
// import Token from '../models/openstack/Token'
import { range } from '../util'

function loadPreset () {
  console.log(`Loading 'dev' preset.`)

  // Tenants
  const serviceTenant = new Tenant({ name: 'service' })
  const testTenant = new Tenant({ name: 'test' })

  // Create a bunch of tenants
  range(2).forEach(i => {
    new Tenant({ name: `Tenant #${i}`, description: `${i}` })
  })

  // Regions
  const region = new Region({ id: 'Default Region' })

  // Roles
  const adminRole = new Role({ name: 'admin' })
  const memberRole = new Role({ name: '_member_' })

  // Users

  // Create an admin user
  const adminUser = new User({ name: 'admin@platform9.com', password: 'secret', tenant: serviceTenant })
  adminUser.addRole(serviceTenant, adminRole)
  adminUser.rolePair = context.getTenantRoles(adminUser.id)

  // Create a bunch of misc users
  range(2).forEach(i => {
    let email = `user${i}@platform9.com`
    let user = new User({
      email,
      username: email,
      name: email,
      password: 'secret',
      tenantId: serviceTenant.id,
    })
    user.addRole(serviceTenant, memberRole)
    user.addRole(testTenant, memberRole)
    user.rolePair = context.getTenantRoles(user.id)
  })

  // Tenants & users
  range(4).forEach(i => {
    let tenant = new TenantUser({
      description: `Test tenant ${i} description`,
      domain_id: '77c53dae6ab6421caaddc34cd56becb4',
      enabled: true,
      id: i,
      name: `tenant-${i}`,
    })
    // Add a bunch of users for the current Tenant
    range(2).forEach(j => {
      let email = `tenant${i}User${j}@platform9.com`
      let user = new User({
        id: j,
        email,
        username: email,
        name: email,
        password: 'secret',
        tenantId: serviceTenant.id,
        displayname: `Test user ${j}`,
        enabled: true,
        mfa: {
          enabled: false
        },
      })
      user.addRole(serviceTenant, memberRole)
      user.addRole(testTenant, memberRole)
      user.rolePair = context.getTenantRoles(user.id)
      tenant.addUser(user)
    })
  })

  // Groups
  new Group({
    name: 'test_group',
    description: 'test description'
  })
  new Group({
    name: 'test_group_2',
    description: 'test 2 description'
  })

  // Flavors
  new Flavor({ name: 'm1.tiny', ram: 512, disk: 1, vcpus: 1, tags: '{key:value}' })
  new Flavor({ name: 'm1.small', ram: 2048, disk: 20, vcpus: 1 })
  new Flavor({ name: 'm1.medium', ram: 4096, disk: 40, vcpus: 2 })
  new Flavor({ name: 'm1.large', ram: 8192, disk: 80, vcpus: 4, tags: '{key:value}' })
  new Flavor({ name: 'm1.xlarge', ram: 16384, disk: 160, vcpus: 8 })

  // Instances
  new Instance({ name: 'Test Instance 1', status: 'ACTIVE', state: 'active' })
  new Instance({ name: 'Test Instance 2', status: 'ERROR', state: 'error' })
  new Instance({ name: 'Test Instance 3', status: 'BUILD', state: 'building' })

  // Networks
  new Network({ name: 'Test network 1', subnets: '10.10.0.0/1', tenant: 'Dev Tenant', shared: false, port_security_enabled: true, external: true, admin_state_up: false, status: 'ACTIVE' })
  new Network({ name: 'Test network 2', subnets: '10.10.0.0/2', tenant: 'Test Tenant', shared: true, port_security_enabled: false, external: true, admin_state_up: true, status: 'ACTIVE' })

  // Routers
  new Router({ name: 'Test router 1', tenant_id: '1234abcd', project: 'Dev Tenant', admin_state_up: true, status: 'ACTIVE' })

  // Floating IPs
  new FloatingIp({ floating_ip_address: '123.234.123', subnet_id: 'qwertyuiop', port_id: 'asdfasdf', 'project_id': '1234abcd', 'tenant_id': '1234abcd', 'fixed_ip_address': '10.1.10.123', 'description': 'preset floating ip', 'floating_network_id': 'zxcvbnm', 'status': 'ACTIVE', 'router_id': 'awsd' })

  // Volumes
  new Volume({ name: 'TestVolume1', description: 'Docker storage test.', volume_type: 'sfvol', metadata: '', size: 15, bootable: false, status: 'available', tenant: 'Dev Team Tenant', source: 'Image', host: 'host.company.sys', instance: 'Test Instance 1', device: '/dev/vdb', attachedMode: 'rw', readonly: false })
  new Volume({ name: 'TestVolume2', description: 'Docker storage test.', volume_type: 'testType', metadata: '', size: 30, bootable: false, status: 'available', tenant: 'Dev Team Tenant', source: 'Snapshot', host: 'host.company.sys', instance: 'Test Instance 2', device: '/dev/vdb', attachedMode: '', readonly: false })
  new Volume({ name: 'TestVolume3', description: '', volume_type: 'sfvol', metadata: '', size: 45, bootable: true, status: 'in-use', tenant: 'Dev Team Tenant', source: 'Empty', host: 'host.company.sys', instance: 'Dev Instance 1', device: '', attachedMode: 'rw', readonly: false })
  new Volume({ name: 'TestVolume4', description: 'Convert volume to ext.', volume_type: 'sfvol', metadata: '', size: 1, bootable: false, status: 'available', tenant: 'Dev Team Tenant', source: 'Image', host: 'host.company.sys', instance: 'Dev Instance 1', device: '/dev/vdb', attachedMode: 'rw', readonly: false })
  new Volume({ name: 'TestVolume5', description: '', volume_type: 'testType', metadata: '', size: 25, bootable: false, status: 'in-use', tenant: 'Dev Team Tenant', source: 'Another Volume', host: 'host.company.sys', instance: 'Dev Instance 2', device: '', attachedMode: '', readonly: false })

  // Glance Images
  new Image({ name: 'Test-Image-1', pf9_description: 'Base CentOS Image Version 5', status: 'OK', owner: 'Development Team Tenant', visibility: 'private', protected: false, disk_format: 'qcow2', virtual_size: 40, size: 15 })
  new Image({ name: 'Test-Image-2', pf9_description: 'Version 1118', status: 'OK', owner: 'Development Team Tenant', visibility: 'public', protected: false, disk_format: 'qcow2', virtual_size: 50, size: 8 })
  new Image({ name: 'Test-Image-3', pf9_description: 'A plain test image.', status: 'OK', owner: 'Development Team Tenant', visibility: 'private', protected: true, disk_format: 'qcow2', virtual_size: 100, size: 22 })

  // Applications
  new Application({ name: 'ApacheHttpServer', author: 'admin', public: true, tenant: 'Development Team Tenant', description: 'The Apache HTTP Server Project is a collaborative software development effort aimed at creating a robust, commercial-grade, featureful, and freely-available source code implementation of an HTTP (Web) server.', categories: 'Web' })
  new Application({ name: 'WordPress', author: 'admin', public: true, tenant: 'Development Team Tenant', description: 'WordPress is a free and open-source content management system (CMS) based on PHP and MySQL.', categories: 'SAP' })
  new Application({ name: 'MongoDB', author: 'user', public: true, tenant: 'Test Tenant', description: 'MongoDB is a cross-platform document-oriented database. Classified as a NoSQL database, MongoDB eschews the traditional table-based relational database structure in favor of JSON-like documents with dynamic schemas.', categories: 'Databases' })

  // SSH Keys
  new SshKey({ name: 'test1', public_key: 'sa9d87hf90sa7d98h7f0a9s87hf8907hasdf' })
  new SshKey({ name: 'test2', public_key: '8wekaf098kewf7s9dk7f98k7we98fs908d7f' })

  // Hypervisors
  new Hypervisor({ resMgrId: '1awf13fjsf90j', hypervisor_hostname: 'fake hypervisor', status: 'enabled', host_ip: '1.2.3.4', ipInfo: [{ ip: '1.2.3.4', if_name: 'my-interface' }] })

  // ResMgrHosts
  const resMgrHost = new ResMgrHost({ roles: ['pf9-ostackhost'], info: { hostname: 'fake resmgr host' } })
  const resMgrHost2 = new ResMgrHost({ roles: ['pf9-ostackhost', 'pf9-kube'], info: { hostname: 'fake resmgr host 2' } })
  const resMgrHost3 = new ResMgrHost({ roles: ['pf9-ostackhost', 'pf9-kube'], info: { hostname: 'fake resmgr host 3' } })

  // Cloud Providers
  CloudProvider.create({ data: { name: 'mockAwsProvider', type: 'aws' }, context })
  CloudProvider.create({ data: { name: 'mockOpenstackProvider', type: 'openstack' }, context })
  CloudProvider.create({ data: { name: 'mockLocalProvider', type: 'local' }, context })

  // Clusters
  const cluster = Cluster.create({ data: { name: 'fakeCluster1', sshKey: 'someKey', tags: { 'pf9-system:monitoring': 'true' } }, context, raw: true })
  const cluster2 = Cluster.create({ data: { name: 'fakeCluster2', sshKey: 'someKey' }, context, raw: true })
  Cluster.create({ data: { name: 'fakeCluster3' }, context })
  Cluster.create({ data: { name: 'mockAwsCluster', cloudProviderType: 'aws' }, context })
  Cluster.create({ data: { name: 'mockOpenStackCluster', cloudProviderType: 'openstack' }, context })

  // Nodes
  // Nodes must be linked to a resMgrHost id or else the UI will break
  const node = Node.create({
    data: { name: 'fakeNode1', api_responding: 1, isMaster: 1, uuid: resMgrHost.id },
    context,
    raw: true
  })
  const node2 = Node.create({
    data: { name: 'fakeNode2', api_responding: 1, isMaster: 1, uuid: resMgrHost2.id },
    context,
    raw: true
  })
  Node.create({ data: { name: 'fakeNode3', uuid: resMgrHost3.id }, context })

  attachNodeToCluster(node, cluster)
  attachNodeToCluster(node2, cluster2)

  // Add Prometheus Instances to 'cluster'
  PrometheusInstance.create({ clusterId: cluster.uuid })
  PrometheusInstance.create({ clusterId: cluster.uuid })

  // Namespaces
  const defaultNamespace = Namespace.create({ data: { name: 'default' }, context, config: { clusterId: cluster.uuid }, raw: true })
  const defaultNamespace2 = Namespace.create({ data: { name: 'default' }, context, config: { clusterId: cluster2.uuid }, raw: true })

  // Pods
  Pod.create({ data: { metadata: { name: 'fakePod' } }, context, config: { clusterId: cluster.uuid, namespace: defaultNamespace.name } })
  Pod.create({ data: { metadata: { name: 'fakePod2' } }, context, config: { clusterId: cluster2.uuid, namespace: defaultNamespace2.name } })

  // Deployments (and pods)
  Deployment.create({ data: { metadata: { name: 'fakeDeployment' }, spec: { replicas: 2 } }, context, config: { clusterId: cluster.uuid, namespace: defaultNamespace.name } })

  // Services
  Service.create({ data: { metadata: { name: 'fakeService' } }, context, config: { clusterId: cluster.uuid, namespace: defaultNamespace.name } })

  // Storage Classes
  StorageClass.create({ data: { metadata: { name: 'fakeStorageClass', annotations: { 'storageclass.kubernetes.io/is-default-class': 'true' } } }, context, config: { clusterId: cluster.uuid } })

  // Monocular Charts
  range(3).forEach(i => {
    const chart = Chart.create({ data: {}, context, config: { clusterId: cluster.uuid, namespace: defaultNamespace.name } })
    range(3).forEach(i => ChartVersion.create({
      data: {
        id: chart.id
      },
      context
    }))
  })

  // Monocular releases
  range(3).forEach(i => Release.create({ data: {}, context, config: { clusterId: cluster.uuid, namespace: defaultNamespace.name } }))

  // Monocular repositories
  range(3).forEach(i => Repository.create({ data: {}, context, config: { clusterId: cluster.uuid, namespace: defaultNamespace.name } }))

  // Qbert repositories
  range(3).forEach(i => ClusterRepository.create({ data: {}, context, config: { clusterId: cluster.uuid, namespace: defaultNamespace.name } }))
}

export default loadPreset
