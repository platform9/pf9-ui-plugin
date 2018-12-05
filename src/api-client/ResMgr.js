import axios from 'axios'

const roleNames = {
  'pf9-ceilometer': 'Telemetry',
  'pf9-ceilometer-vmw': 'Telemetry',
  'pf9-cindervolume-base': 'Block Storage',
  'pf9-designate': 'Designate',
  'pf9-glance-role': 'Image Library',
  'pf9-glance-role-vmw': 'VMware Glance',
  'pf9-kube': 'Containervisor',
  'pf9-ostackhost-neutron-ironic': 'Ironic',
}

export const localizeRole = role => roleNames[role]

class ResMgr {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.resmgr.internal.url
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
    const response = await axios.delete(url, this.client.getAuthHeaders())
    return response
  }
}

export default ResMgr
