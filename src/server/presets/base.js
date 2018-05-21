/* eslint-disable no-unused-vars */
import context from '../context'
import Region from '../models/Region'
import Role from '../models/Role'
import Tenant from '../models/Tenant'
import User from '../models/User'
import Flavor from '../models/Flavor'
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
  adminUser.addRole(adminRole)
}

export default loadPreset
