import { partition, uniq, includes } from 'ramda'
import ApiService from 'api-client/ApiService'
import { Host } from './resmgr.model'

const roleNames = {
  'pf9-ostackhost-neutron': 'Hypervisor',
  'pf9-ostackhost': 'Hypervisor',
  'pf9-ostackhost-neutron-vmw': 'VMware Cluster',
  'pf9-ostackhost-vmw': 'VMware Cluster',
  'pf9-ceilometer': 'Telemetry',
  'pf9-ceilometer-vmw': 'Telemetry',
  'pf9-cindervolume-base': 'Block Storage',
  'pf9-designate': 'Designate',
  'pf9-glance-role': 'Image Library',
  'pf9-glance-role-vmw': 'VMware Glance',
  'pf9-kube': 'Containervisor',
  'pf9-ostackhost-neutron-ironic': 'Ironic',
  'pf9-contrail-forwarder': 'Contrail Forwarder',
  'pf9-midonet-forwarder': 'MidoNet Node',
}

const neutronComponents = [
  'pf9-neutron-base',
  'pf9-neutron-ovs-agent',
  'pf9-neutron-l3-agent',
  'pf9-neutron-dhcp-agent',
  'pf9-neutron-metadata-agent',
]

export const localizeRole = (role) => roleNames[role] || role

export const localizeRoles = (roles: string[] = []) => {
  const isNeutronRole = (role) => includes(role, neutronComponents)
  const [neutronRoles, normalRoles] = partition(isNeutronRole, roles)
  const hasAllNetworkRoles = neutronRoles.length === neutronComponents.length
  return uniq([...normalRoles.map(localizeRole), ...(hasAllNetworkRoles ? ['Network Node'] : [])])
}

class ResMgr extends ApiService {
  public getClassName() {
    return 'resmgr'
  }

  protected async getEndpoint() {
    const endpoint = await this.client.keystone.getServiceEndpoint('resmgr', 'internal')
    return `${endpoint}/v1`
  }

  async getHosts() {
    const url = `/hosts`
    const response = await this.client.basicGet<Host[]>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getHosts',
      },
    })
    return response
  }

  async addRole(hostId, role, body) {
    const url = `/hosts/${hostId}/roles/${role}`
    return this.client.basicPut({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addRole',
      },
    })
  }

  async removeRole(hostId, role): Promise<void> {
    const url = `/hosts/${hostId}/roles/${role}`
    await this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'removeRole',
      },
    })
  }

  async getRole(hostId, role) {
    const url = `/hosts/${hostId}/roles/${role}`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRole',
      },
    })
  }

  async unauthorizeHost(id) {
    const url = `/hosts/${id}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'unauthorizeHost',
      },
    })
  }

  async getService(service) {
    const url = `/services/${service}`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getService',
      },
    })
  }

  async updateService(service, body) {
    const url = `/services/${service}`
    return this.client.basicPut({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateService',
      },
    })
  }
}

export default ResMgr
