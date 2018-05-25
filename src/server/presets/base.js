/* eslint-disable no-unused-vars */
import context from '../context'
import Region from '../models/Region'
import Role from '../models/Role'
import Tenant from '../models/Tenant'
import User from '../models/User'
import Flavor from '../models/Flavor'
import Volume from '../models/Volume'
// import Token from '../models/Token'

function loadPreset () {
  console.log(`Loading 'base' preset.`)
  const serviceTenant = new Tenant({ name: 'service' })
  const adminRole = new Role({ name: 'admin' })
  const memberRole = new Role({ name: '_member_' })
  const adminUser = new User({ username: 'admin@platform9.com', password: 'secret', tenant: serviceTenant })
  const region = new Region({ name: 'Default Region' })
  new Flavor({ name: 'm1.tiny', ram: 512, disk: 1, vcpus: 1 })
  new Flavor({ name: 'm1.small', ram: 2048, disk: 20, vcpus: 1 })
  new Flavor({ name: 'm1.medium', ram: 4096, disk: 40, vcpus: 2 })
  new Flavor({ name: 'm1.large', ram: 8192, disk: 80, vcpus: 4 })
  new Flavor({ name: 'm1.xlarge', ram: 16384, disk: 160, vcpus: 8 })
  new Volume({ name: 'TestVolume1', description: 'Lalala', type: 'SOF', metadata: 'ad', size: 15, sizeUnit: 'GB', bootable: false, status: 'available', tenantId: 'a', tenant: 'DEV1', source: 'Image', host: '', instance: 'It1', instanceId: '', device: 'Nothing', attachedMode: 'rw', readonly: false })
  new Volume({ name: 'TestVolume2', description: 'Yayaya', type: 'KOF', metadata: 'fe', size: 30, sizeUnit: 'GB', bootable: false, status: 'available', tenantId: 'b', tenant: 'DEV2', source: 'Snapshot', host: '', instance: 'It2', instanceId: '', device: 'Nothing', attachedMode: 'rw', readonly: false })
  new Volume({ name: 'TestVolume3', description: 'Hahaha', type: 'NYC', metadata: 'ef', size: 45, sizeUnit: 'GB', bootable: false, status: 'available', tenantId: 'c', tenant: 'DEV3', source: 'Empty', host: '', instance: 'It3', instanceId: '', device: 'Nothing', attachedMode: 'rw', readonly: false })
  new Volume({ name: 'TestVolume4', description: 'Tatata', type: 'MTV', metadata: 'df', size: 10, sizeUnit: 'GB', bootable: false, status: 'available', tenantId: 'd', tenant: 'DEV4', source: 'Image', host: '', instance: 'It4', instanceId: '', device: 'Nothing', attachedMode: 'rw', readonly: false })
  new Volume({ name: 'TestVolume5', description: 'Nanana', type: 'CCTV', metadata: 'ad', size: 25, sizeUnit: 'GB', bootable: false, status: 'available', tenantId: 'e', tenant: 'DEV5', source: 'Empty', host: '', instance: 'It5', instanceId: '', device: 'Nothing', attachedMode: 'rw', readonly: false })
  adminUser.addRole(adminRole)
}

export default loadPreset
