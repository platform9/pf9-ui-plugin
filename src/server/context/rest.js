import OpenstackClient from '../../openstack-client'
import config from '../../../config'

class Context {
  resetContext () {}

  // Unlike the simulator, the FE server does not know anything about this.
  // Don't check auth token in the server, let the REST API do that.
  validateToken = () => true

  getTenants = async () => {
    const tenants = await this.client.keystone.getProjects(true)
    return tenants
  }

  createTenant = async ({ input }) => {
    const newTenant = await this.client.keystone.createProject(input)
    return newTenant
  }

  removeTenant = id => this.client.keystone.deleteProject(id)
}

const context = new Context()
context.client = new OpenstackClient({
  keystoneEndpoint: `${config.apiHost}/keystone`
})

export default context
