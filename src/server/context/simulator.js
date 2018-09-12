import Catalog from '../models/Catalog'
import Flavor from '../models/Flavor'
import Role from '../models/Role'
import Tenant from '../models/Tenant'
import User from '../models/User'
import Volume from '../models/Volume'
import GlanceImage from '../models/GlanceImage'
import Network from '../models/Network'
import Router from '../models/Router'
import FloatingIp from '../models/FloatingIp'
import Token from '../models/Token'
import Application from '../models/Application'
import SshKey from '../models/SshKey'

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
    this.routers = []
    this.floatingIps = []
    this.instances = []
    this.hypervisors = []
    this.userRoles = []
    this.resMgrRoles = []
    this.hostAggregates = []
    this.regions = []
    this.volumes = []
    this.glanceImages = []
    this.applications = []
    this.sshKeys = []
    this.defaultQuota = { ...defaultQuota }
  }

  validateToken = id => Token.validateToken(id)

  getFlavor = id => {
    const flavor = Flavor.findById(id)
    if (!flavor) {
      throw new Error('Unable to find non-existent flavor')
    }
    return flavor.asGraphQl()
  }

  getFlavors = () => Flavor.getCollection().map(x => x.asGraphQl())

  createFlavor = ({ input }) => {
    const flavor = new Flavor({...input})
    return flavor.asGraphQl()
  }

  updateFlavor = (id, input) => {
    const flavor = Flavor.updateById(id, input)
    if (!flavor) {
      throw new Error('Unable to update non-existent flavor')
    }
    return flavor.asGraphQl()
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

  getTenantRoles = id => {
    const user = User.findById(id).asJson()
    return user.roles.map(({ tenant, role }) => (JSON.stringify({
      // tenant: Tenant.findById(tenant.id).asGraphQl(),
      // role: Role.findById(role.id).asGraphQl()
      tenant: Tenant.findById(tenant.id).asJson().name,
      role: Role.findById(role.id).asJson().name
    })))
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

  getNetwork = id => {
    const network = Network.findById(id)
    if (!network) {
      throw new Error('Unable to get non-existent network')
    }
    return network.asGraphQl()
  }

  getNetworks = () => Network.getCollection().map(x => x.asGraphQl())

  createNetwork = ({ input }) => {
    const network = new Network(input)
    return network.asGraphQl()
  }

  updateNetwork = (id, input) => {
    let network = Network.updateById(id, input)
    if (!network) {
      throw new Error('Unable to update non-existent network')
    }
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

  getRouter = id => {
    const router = Router.findById(id)
    if (!router) {
      throw new Error('Unable to get non-existent router')
    }
    return router.asGraphQl()
  }

  getRouters = () => Router.getCollection().map(x => x.asGraphQl())

  createRouter = ({ input }) => {
    const router = new Router(input)
    return router.asGraphQl()
  }

  updateRouter = (id, input) => {
    let router = Router.updateById(id, input)
    if (!router) {
      throw new Error('Unable to update non-existent router')
    }
    return router.asGraphQl()
  }

  removeRouter = (id) => {
    const router = Router.findById(id)
    if (!router) {
      throw new Error('Unable to remove non-existent router')
    }
    router.destroy()
    return router
  }

  getFloatingIp = id => {
    const floatingIp = FloatingIp.findById(id)
    if (!floatingIp) {
      throw new Error('Unable to get non-existent floating IP')
    }
    return floatingIp.asGraphQl()
  }

  getFloatingIps = () => FloatingIp.getCollection().map(x => x.asGraphQl())

  createFloatingIp = ({ input }) => {
    const floatingIp = new FloatingIp(input)
    return floatingIp.asGraphQl()
  }

  updateFloatingIp = (id, input) => {
    let floatingIp = FloatingIp.updateById(id, input)
    if (!floatingIp) {
      throw new Error('Unable to update non-existent floating IP')
    }
    return floatingIp.asGraphQl()
  }

  removeFloatingIp = (id) => {
    const floatingIp = FloatingIp.findById(id)
    if (!floatingIp) {
      throw new Error('Unable to remove non-existent floating IP')
    }
    floatingIp.destroy()
    return floatingIp
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

  getGlanceImage = (id) => {
    const glanceImage = GlanceImage.findById(id)
    if (!glanceImage) {
      throw new Error('Unable to find non-existent glance image')
    }
    return glanceImage
  }

  getGlanceImages = () => GlanceImage.getCollection().map(x => x.asGraphQl())

  updateGlanceImage = (id, input) => {
    const glanceImage = GlanceImage.updateById(id, input)
    if (!glanceImage) {
      throw new Error('Unable to update non-existent glance image')
    }
    return glanceImage.asGraphQl()
  }

  removeGlanceImage = id => {
    const glanceImage = GlanceImage.findById(id)
    if (!glanceImage) {
      throw new Error('Unable to delete non-existent glance image')
    }
    glanceImage.destroy()
    return id
  }

  getApplication = id => {
    const application = Application.findById(id)
    if (!application) {
      throw new Error('Unable to find non-existent application')
    }
    return application.asGraphQl()
  }

  getApplications = () => Application.getCollection().map(x => x.asGraphQl())

  createApplication = ({ input }) => {
    const application = new Application(input)
    return application.asGraphQl()
  }

  updateApplication = (id, input) => {
    const application = Application.updateById(id, input)
    if (!application) {
      throw new Error('Unable to update non-existent application')
    }
    return application.asGraphQl()
  }

  removeApplication = id => {
    const application = Application.findById(id)
    if (!application) {
      throw new Error('Unable to delete non-existent application')
    }
    application.destroy()
    return id
  }

  getSshKey = id => {
    const sshKey = SshKey.findById(id)
    if (!sshKey) {
      throw new Error('Unable to find non-existent ssh key')
    }
    return sshKey.asGraphQl()
  }

  getSshKeys = () => SshKey.getCollection().map(x => x.asGraphQl())

  createSshKey = ({ input }) => {
    const sshKey = new SshKey(input)
    return sshKey.asGraphQl()
  }

  removeSshKey = name => {
    const sshKey = SshKey.findByName(name)
    if (!sshKey) {
      throw new Error('Unable to delete non-existent ssh key')
    }
    sshKey.destroy()
    return name
  }
}

const context = new Context()

export default context
