import ApiClient from '../../api-client'
import config from '../../../config'

// Convert null values from API to 0.
const sanitizeFlavor = flavor => ({
  ...flavor,
  disk: flavor.disk || 0,
  ram: flavor.ram || 0,
  vcpus: flavor.vcpus || 0,
})

const sanitizeVolumeType = vt => ({
  ...vt,
  extra_specs: JSON.stringify((vt.extra_specs || {})),
})

class Context {
  resetContext () {}

  // Unlike the simulator, the FE server does not know anything about this.
  // Don't check auth token in the server, let the REST API do that.
  validateToken = () => true

  getTenant = id => this.client.keystone.getTenant(id)
  getTenants = () => this.client.keystone.getProjects(true)
  updatetenant = (id, params) => this.client.keystone.updateProject(id, params)
  removeTenant = id => this.client.keystone.deleteProject(id)

  createTenant = async ({ input }) => {
    const newTenant = await this.client.keystone.createProject(input)
    return newTenant
  }

  getUser = id => this.client.keystone.getUser(id)
  createUser = ({ input }) => this.client.keystone.createUser(input)
  updateUser = (id, params) => this.client.keystone.updateUser(id, params)
  removeUser = id => this.client.keystone.deleteUser(id)

  getUsers = async () => {
    const users = (await this.client.keystone.getUsers() || [])
    // Sometimes the API returns users without a username.
    const sanitized = users.map(user => ({ ...user, username: user.username || '' }))
    return sanitized
  }

  getFlavor = async id => sanitizeFlavor(await this.client.nova.getFlavor(id))
  getFlavors = async () => (await this.client.nova.getFlavors() || []).map(sanitizeFlavor)
  createFlavor = ({ input }) => this.client.nova.createFlavor(input)
  removeFlavor = id => this.client.nova.deleteFlavor(id)

  getVolumes = () => this.client.cinder.getVolumes()

  getVolumeTypes = async () => {
    const volumeTypes = await this.client.cinder.getVolumeTypes()
    const vts = (volumeTypes || []).map(sanitizeVolumeType)
    return vts
  }

  getFloatingIps = () => this.client.neutron.getFloatingIps()
  createFloatingIp = ({ input }) => this.client.neutron.createFloatingIp(input)
  removeFloatingIp = id => this.client.neutron.deleteFloatingIp(id)
}

const context = new Context()
context.client = new ApiClient({
  keystoneEndpoint: `${config.apiHost}/keystone`
})

export default context
