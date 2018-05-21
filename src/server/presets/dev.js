/* eslint-disable no-unused-vars, no-undef */
import context from '../context'
import Region from '../models/Region'
import Role from '../models/Role'
import Tenant from '../models/Tenant'
import User from '../models/User'
import Flavor from '../models/Flavor'
import Network from '../models/Network'
// import Token from '../models/Token'
import { range } from '../util'

function loadPreset () {
  console.log(`Loading 'dev' preset.`)

  // Tenants
  const serviceTenant = new Tenant({ name: 'service' })

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

  // Create a bunch of misc users
  range(2).forEach(i => {
    let email = `user${i}@platform9.com`
    let user = new User({
      email,
      username: email,
      name: email,
      password: 'secret',
      tenant: serviceTenant,
    })
    user.addRole(serviceTenant, memberRole)
  })

  // Flavors
  new Flavor({ name: 'm1.tiny', ram: 512, disk: 1, vcpus: 1 })
  new Flavor({ name: 'm1.small', ram: 2048, disk: 20, vcpus: 1 })
  new Flavor({ name: 'm1.medium', ram: 4096, disk: 40, vcpus: 2 })
  new Flavor({ name: 'm1.large', ram: 8192, disk: 80, vcpus: 4 })
  new Flavor({ name: 'm1.xlarge', ram: 16384, disk: 160, vcpus: 8 })

  // Networks
  new Network({ name: 'default network' })
}

export default loadPreset
