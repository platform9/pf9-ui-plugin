import axios from 'axios'
import { __, partition, uniq, includes } from 'ramda'

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

export const localizeRole = role => roleNames[role] || role

export const localizeRoles = (roles = []) => {
  const isNeutronRole = includes(__, neutronComponents)
  const [neutronRoles, normalRoles] = partition(isNeutronRole, roles)
  const hasAllNetworkRoles = neutronRoles.length === neutronComponents.length
  return uniq([
    ...normalRoles.map(localizeRole),
    ...hasAllNetworkRoles ? ['Network Node'] : []
  ])
}

class ResMgr {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const endpoint = await this.client.keystone.getServiceEndpoint('resmgr', 'internal')
    const v1Endpoint = `${endpoint}/v1`
    return v1Endpoint
  }

  async getHosts () {
    const url = `${await this.endpoint()}/hosts`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data
  }

  async unauthorizeHost (id) {
    const url = `${await this.endpoint()}/hosts/${id}`
    return axios.delete(url, this.client.getAuthHeaders())
  }
}

export default ResMgr
