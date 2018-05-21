import { mapAsJson } from './helpers'
import Role from './models/Role'
import Tenant from './models/Tenant'
import User from './models/User'

const defaultQuota = {
  cores: 10,
  ram: 10000,
  root_gb: 100,
  instances: 10,
}

class Context {
  constructor () {
    this.resetContext()
  }

  resetContext () {
    this.novaTimeout = 6 * 1000
    this.users = []
    this.hosts = []
    this.roles = []
    this.tokens = []
    this.images = []
    this.tenants = []
    this.flavors = []
    this.servers = []
    this.networks = []
    this.instances = []
    this.hypervisors = []
    this.userRoles = []
    this.resMgrRoles = []
    this.hostAggregates = []
    this.regions = []

    this.defaultQuota = { ...defaultQuota }
  }

  getFlavors = () => mapAsJson(this.flavors)
  getUsers = () => mapAsJson(this.users)
  getTenantRoles = userObj => {
    const user = User.findById(userObj.id)
    return user.roles.map(({ tenant, role }) => ({
      tenant: Tenant.findById(tenant.id).asGraphQl(),
      role: Role.findById(role.id).asGraphQl()
    }))
  }

  getTenants = () => {
    return Tenant.getCollection().map(x => x.asGraphQl())
  }

  removeTenant = id => {
    const tenant = Tenant.findById(id)
    tenant.destroy()
    return id
  }
}

const context = new Context()

export default context
