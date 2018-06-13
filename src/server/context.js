import Catalog from './models/Catalog'
import Flavor from './models/Flavor'
import Role from './models/Role'
import Tenant from './models/Tenant'
import User from './models/User'
import Volume from './models/Volume'
import GlanceImage from './models/GlanceImage'
import Network from './models/Network'

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
    this.glanceImages = []
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
      throw new Error('Unable to update non-existent flavor')
    }
  }

  removeFlavor = id => {
    const flavor = Flavor.findById(id)
    if (!flavor) {
      throw new Error('Unable to remove non-existent flavor')
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
      throw new Error('Unable to update non-existent tenant')
    }
  }

  removeTenant = id => {
    const tenant = Tenant.findById(id)
    if (!tenant) {
      throw new Error('Unable to remove non-existent tenant')
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

  getUser = (id) => {
    const user = User.findById(id)
    if (!user) {
      throw new Error('Unable to find non-existent user')
    }
    return user.asGraphQl()
  }

  getUsers = () => User.getCollection().map(x => x.asGraphQl())

  createUser = ({ input }) => {
    const user = new User(input)
    return user.asGraphQl()
  }

  updateUser = (id, input) => {
    let user = User.updateById(id, input)
    if (!user) {
      throw new Error('Unable to update non-existent user')
    }
    return user.asGraphQl()
  }

  removeUser = id => {
    const user = User.findById(id)
    if (!user) {
      throw new Error('Unable to remove non-existent user')
    }
    user.destroy()
    return id
  }

  getNetworks = () => Network.getCollection().map(x => x.asGraphQl())

  createNetwork = ({ input }) => {
    const network = new Network(input)
    return network.asGraphQl()
  }

  removeNetwork = (id) => {
    const network = Network.findById(id)
    if (!network) {
      throw new Error('Unable to remove non-existent network')
    }
    network.destroy()
    return network
  }

  getVolume = (id) => {
    const volume = Volume.findById(id)
    if (!volume) {
      throw new Error('Unable to find non-existent volume')
    }
    return volume.asGraphQl()
  }

  getVolumes = () => Volume.getCollection().map(x => x.asGraphQl())

  createVolume = ({ input }) => {
    const volume = new Volume(input)
    return volume.asGraphQl()
  }

  updateVolume = (id, input) => {
    let volume = Volume.updateById(id, input)
    if (!volume) {
      throw new Error('Unable to update non-existent volume')
    }
    return volume.asGraphQl()
  }

  removeVolume = id => {
    const volume = Volume.findById(id)
    if (!volume) {
      throw new Error('Unable to delete non-existent volume')
    }
    volume.destroy()
    return id
  }

  getServiceCatalog = () => Catalog.getCatalog()

  getGlanceImages = () => GlanceImage.getCollection().map(x => x.asGraphQl())

  updateGlanceImage = ({ id, input }) => {
    const glanceImage = GlanceImage.findById(id)
    if (!glanceImage) {
      throw new Error('Unable to update non-existent glance image')
    }
  }

  removeGlanceImage = ({ id }) => {
    const glanceImage = GlanceImage.findById(id)
    if (!glanceImage) {
      throw new Error('Unable to update non-existent glance image')
    }
    glanceImage.destroy()
    return id
  }
}

const context = new Context()

export default context
