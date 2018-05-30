import Catalog from './models/Catalog'
import Flavor from './models/Flavor'
import Role from './models/Role'
import Tenant from './models/Tenant'
import User from './models/User'
import Volume from './models/Volume'

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
    this.volumes = []

    this.defaultQuota = { ...defaultQuota }
  }

  getFlavors = () => Flavor.getCollection().map(x => x.asGraphQl())

  createFlavor = ({ input }) => {
    const flavor = new Flavor({...input})
    return flavor.asGraphQl()
  }

  updateFlavor = (id, { input }) => {
    const flavor = Flavor.findById(id)
    if (!flavor) {
      throw new Error('Unable to update non-existant flavor')
    }
  }

  removeFlavor = id => {
    const flavor = Flavor.findById(id)
    if (!flavor) {
      throw new Error('Unable to remove non-existant flavor')
    }
    flavor.destroy()
    return id
  }

  getTenants = () =>
    Tenant.getCollection().map(x => x.asGraphQl())

  createTenant = ({ input }) => {
    const tenant = new Tenant({...input})
    return tenant.asGraphQl()
  }

  updateTenant = (id, { input }) => {
    const tenant = Tenant.findById(id)
    if (!tenant) {
      throw new Error('Unable to update non-existant tenant')
    }
  }

  removeTenant = id => {
    const tenant = Tenant.findById(id)
    if (!tenant) {
      throw new Error('Unable to remove non-existant tenant')
    }
    tenant.destroy()
    return id
  }

  getTenantRoles = userObj => {
    const user = User.findById(userObj.id)
    return user.roles.map(({ tenant, role }) => ({
      tenant: Tenant.findById(tenant.id).asGraphQl(),
      role: Role.findById(role.id).asGraphQl()
    }))
  }

  getUsers = () => User.getCollection().map(x => x.asGraphQl())

  createUser = ({ input }) => {
    const user = new User(input)
    return user.asGraphQl()
  }

  updateUser = (id, { input }) => {
    const user = User.findById(id)
    if (!user) {
      throw new Error('Unable to update non-existant user')
    }
  }

  removeUser = id => {
    const user = User.findById(id)
    if (!user) {
      throw new Error('Unable to remove non-existant user')
    }
    user.destroy()
    return id
  }

  getVolumes = () => Volume.getCollection().map(x => x.asGraphQl())

  createVolume = ({ input }) => {
    const volume = new Volume(input)
    return volume.asGraphQl()
  }

  updateVolume = ({ id, input }) => {
    const volume = Volume.findById(id)
    if (!volume) {
      throw new Error('Unable to update non-existant volume')
    }
  }

  removeVolume = ({ id }) => {
    const volume = Volume.findById(id)
    if (!volume) {
      throw new Error('Unable to delete non-existant volume')
    }
    volume.destroy()
    return id
  }

  getServiceCatalog = () => Catalog.getCatalog()
}

const context = new Context()

export default context
