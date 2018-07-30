/* eslint-disable no-unused-vars, no-undef */
import context from '../context'
import Region from '../models/Region'
import Role from '../models/Role'
import Tenant from '../models/Tenant'
import User from '../models/User'
import Flavor from '../models/Flavor'
import Network from '../models/Network'
import Router from '../models/Router'
import Volume from '../models/Volume'
import GlanceImage from '../models/GlanceImage'
import Application from '../models/Application'
// import Token from '../models/Token'
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
  const region = new Region({ name: 'Default Region' })

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

  // Flavors
  new Flavor({ name: 'm1.tiny', ram: 512, disk: 1, vcpus: 1, tags: '{key:value}' })
  new Flavor({ name: 'm1.small', ram: 2048, disk: 20, vcpus: 1 })
  new Flavor({ name: 'm1.medium', ram: 4096, disk: 40, vcpus: 2 })
  new Flavor({ name: 'm1.large', ram: 8192, disk: 80, vcpus: 4, tags: '{key:value}' })
  new Flavor({ name: 'm1.xlarge', ram: 16384, disk: 160, vcpus: 8 })

  // Networks
  new Network({ name: 'Test network 1', subnets: '10.10.0.0/1', tenant: 'Dev Tenant', shared: false, port_security_enabled: true, external: true, admin_state_up: false, status: 'ACTIVE' })
  new Network({ name: 'Test network 2', subnets: '10.10.0.0/2', tenant: 'Test Tenant', shared: true, port_security_enabled: false, external: true, admin_state_up: true, status: 'ACTIVE' })

  // Routers
  new Router({ name: 'Test router 1', tenant_id: '1234abcd', project: 'Dev Tenant', admin_state_up: true, status: 'ACTIVE' })

  // Volumes
  new Volume({ name: 'TestVolume1', description: 'Docker storage test.', volume_type: 'sfvol', metadata: '', size: 15, bootable: false, status: 'available', tenant: 'Dev Team Tenant', source: 'Image', host: 'host.company.sys', instance: 'Test Instance 1', device: '/dev/vdb', attachedMode: 'rw', readonly: false })
  new Volume({ name: 'TestVolume2', description: 'Docker storage test.', volume_type: 'testType', metadata: '', size: 30, bootable: false, status: 'available', tenant: 'Dev Team Tenant', source: 'Snapshot', host: 'host.company.sys', instance: 'Test Instance 2', device: '/dev/vdb', attachedMode: '', readonly: false })
  new Volume({ name: 'TestVolume3', description: '', volume_type: 'sfvol', metadata: '', size: 45, bootable: true, status: 'in-use', tenant: 'Dev Team Tenant', source: 'Empty', host: 'host.company.sys', instance: 'Dev Instance 1', device: '', attachedMode: 'rw', readonly: false })
  new Volume({ name: 'TestVolume4', description: 'Convert volume to ext.', volume_type: 'sfvol', metadata: '', size: 1, bootable: false, status: 'available', tenant: 'Dev Team Tenant', source: 'Image', host: 'host.company.sys', instance: 'Dev Instance 1', device: '/dev/vdb', attachedMode: 'rw', readonly: false })
  new Volume({ name: 'TestVolume5', description: '', volume_type: 'testType', metadata: '', size: 25, bootable: false, status: 'in-use', tenant: 'Dev Team Tenant', source: 'Another Volume', host: 'host.company.sys', instance: 'Dev Instance 2', device: '', attachedMode: '', readonly: false })

  // Glance Images
  new GlanceImage({ name: 'Test-Image-1', description: 'Base CentOS Image Version 5', status: 'OK', owner: 'Development Team Tenant', visibility: 'private', protected: false, disk_format: 'qcow2', virtual_size: 40, size: 15 })
  new GlanceImage({ name: 'Test-Image-2', description: 'Version 1118', status: 'OK', owner: 'Development Team Tenant', visibility: 'public', protected: false, disk_format: 'qcow2', virtual_size: 50, size: 8 })
  new GlanceImage({ name: 'Test-Image-3', description: 'A plain test image.', status: 'OK', owner: 'Development Team Tenant', visibility: 'private', protected: true, disk_format: 'qcow2', virtual_size: 100, size: 22 })

  // Applications
  new Application({ name: 'ApacheHttpServer', author: 'admin', public: true, tenant: 'Development Team Tenant', description: 'The Apache HTTP Server Project is a collaborative software development effort aimed at creating a robust, commercial-grade, featureful, and freely-available source code implementation of an HTTP (Web) server.', categories: 'Web' })
  new Application({ name: 'WordPress', author: 'admin', public: true, tenant: 'Development Team Tenant', description: 'WordPress is a free and open-source content management system (CMS) based on PHP and MySQL.', categories: 'SAP' })
  new Application({ name: 'MongoDB', author: 'user', public: true, tenant: 'Test Tenant', description: 'MongoDB is a cross-platform document-oriented database. Classified as a NoSQL database, MongoDB eschews the traditional table-based relational database structure in favor of JSON-like documents with dynamic schemas.', categories: 'Databases' })
}

export default loadPreset
