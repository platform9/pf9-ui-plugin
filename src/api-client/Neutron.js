import axios from 'axios'

class Neutron {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    return this.client.keystone.getServiceEndpoint('neutron', 'admin')
  }

  networkUrl = async () => `${await this.endpoint()}/v2.0/networks`

  async setRegionUrls () {
    const services = (await this.client.keystone.getServiceCatalog()).find(
      x => x.name === 'neutron').endpoints
    return services.reduce((accum, service) => {
      accum[service.region] = service.url + '/v2.0'
      return accum
    }, {})
  }

  async getNetwork (id) {
    const url = `${await this.networkUrl()}/${id}`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.network
  }

  async getNetworks () {
    const url = await this.networkUrl()
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.networks
  }

  async getNetworksForRegion (region) {
    const url = `${(await this.setRegionUrls())[region]}/networks`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.networks
  }

  async createNetwork (params) {
    const url = await this.networkUrl()
    const response = await axios.post(url, { network: params }, this.client.getAuthHeaders())
    return response.data.network
  }

  async deleteNetwork (id) {
    const url = `${await this.networkUrl()}/${id}`
    const response = await axios.delete(url, this.client.getAuthHeaders())
    return response.data.network
  }

  async updateNetwork (id, params) {
    const url = `${await this.networkUrl()}/${id}`
    const response = await axios.put(url, { network: params }, this.client.getAuthHeaders())
    return response.data.network
  }

  async getSubnets () {
    const url = `${await this.endpoint()}/v2.0/subnets`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.subnets
  }

  async createSubnet (params) {
    const url = `${await this.endpoint()}/v2.0/subnets`
    const response = await axios.post(url, { subnet: params }, this.client.getAuthHeaders())
    return response.data.subnet
  }

  async deleteSubnet (id) {
    const url = `${await this.endpoint()}/v2.0/subnets/${id}`
    await axios.delete(url, this.client.getAuthHeaders())
  }

  async updateSubnet (id, params) {
    const url = `${await this.endpoint()}/v2.0/subnets/${id}`
    const response = await axios.put(url, { subnet: params }, this.client.getAuthHeaders())
    return response.data.subnet
  }

  async getPorts () {
    const url = `${await this.endpoint()}/v2.0/ports`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.ports
  }

  async createPort (params) {
    const url = `${await this.endpoint()}/v2.0/ports`
    const response = await axios.post(url, { port: params }, this.client.getAuthHeaders())
    return response.data.port
  }

  async deletePort (id) {
    const url = `${await this.endpoint()}/v2.0/ports/${id}`
    await axios.delete(url, this.client.getAuthHeaders())
  }

  async updatePort (id, params) {
    const url = `${await this.endpoint()}/v2.0/ports/${id}`
    const response = await axios.put(url, { port: params }, this.client.getAuthHeaders())
    return response.data.port
  }

  async getFloatingIps () {
    const url = `${await this.endpoint()}/v2.0/floatingips`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.floatingips
  }

  async createFloatingIp (params) {
    const url = `${await this.endpoint()}/v2.0/floatingips`
    const response = await axios.post(url, { floatingip: params }, this.client.getAuthHeaders())
    return response.data.floatingip
  }

  async detachFloatingIp (id) {
    const url = `${await this.endpoint()}/v2.0/floatingips/${id}`
    const response = await axios.put(url, { floatingip: { port_id: null } }, this.client.getAuthHeaders())
    return response.data.floatingip
  }

  async deleteFloatingIp (id) {
    const url = `${await this.endpoint()}/v2.0/floatingips/${id}`
    await axios.delete(url, this.client.getAuthHeaders())
  }

  async networkIpAvailability (id) {
    const url = `${await this.endpoint()}/v2.0/network-ip-availabilities/${id}`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.network_ip_availability
  }

  async getSecurityGroups () {
    const url = `${await this.endpoint()}/v2.0/security-groups`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.security_groups
  }

  async createSecurityGroup (params) {
    const url = `${await this.endpoint()}/v2.0/security-groups`
    const response = await axios.post(url, { security_group: params }, this.client.getAuthHeaders())
    return response.data.security_group
  }

  async updateSecurityGroup (id, params) {
    const url = `${await this.endpoint()}/v2.0/security-groups/${id}`
    const response = await axios.put(url, { security_group: params }, this.client.getAuthHeaders())
    return response.data.security_group
  }

  async deleteSecurityGroup (id) {
    const url = `${await this.endpoint()}/v2.0/security-groups/${id}`
    await axios.delete(url, this.client.getAuthHeaders())
  }

  async getSecurityGroupRules () {
    const url = `${await this.endpoint()}/v2.0/security-group-rules`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.security_group_rules
  }

  async createSecurityGroupRule (params) {
    const url = `${await this.endpoint()}/v2.0/security-group-rules`
    const response = await axios.post(url, { security_group_rule: params }, this.client.getAuthHeaders())
    return response.data.security_group_rule
  }

  async deleteSecurityGroupRule (id) {
    const url = `${await this.endpoint()}/v2.0/security-group-rules/${id}`
    await axios.delete(url, this.client.getAuthHeaders())
  }

  async getRouters () {
    const url = `${await this.endpoint()}/v2.0/routers`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.routers
  }

  async createRouter (params) {
    const url = `${await this.endpoint()}/v2.0/routers`
    const response = await axios.post(url, { router: params }, this.client.getAuthHeaders())
    return response.data.router
  }

  async updateRouter (id, params) {
    const url = `${await this.endpoint()}/v2.0/routers/${id}`
    const response = await axios.put(url, { router: params }, this.client.getAuthHeaders())
    return response.data.router
  }

  async deleteRouter (id) {
    const url = `${await this.endpoint()}/v2.0/routers/${id}`
    await axios.delete(url, this.client.getAuthHeaders())
  }

  async addInterface (id, params) {
    const url = `${await this.endpoint()}/v2.0/routers/${id}/add_router_interface`
    const response = await axios.put(url, params, this.client.getAuthHeaders())
    return response.data
  }

  async removeInterface (routerId, params) {
    const url = `${await this.endpoint()}/v2.0/routers/${routerId}/remove_router_interface`
    const response = await axios.put(url, params, this.client.getAuthHeaders())
    return response.data
  }

  async getAllQuotas () {
    const url = `${await this.endpoint()}/v2.0/quotas`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.quotas
  }

  async getProjectQuota (id) {
    const url = `${await this.endpoint()}/v2.0/quotas/${id}`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.quota
  }

  async getProjectQuotaForRegion (id, region) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/quotas/${id}`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.quota
  }

  async getDefaultQuotasForRegion (region) {
    const projectId = (await this.client.keystone.getProjects())[0]
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/quotas/${projectId}`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.quota
  }

  async setQuotas (projectId, params) {
    const url = `${await this.endpoint()}/v2.0/quotas/${projectId}`
    const response = await axios.put(url, { quota: params }, this.client.getAuthHeaders())
    return response.data.quota
  }

  async setQuotasForRegion (projectId, region, params) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/quotas/${projectId}`
    const response = await axios.put(url, { quota: params }, this.client.getAuthHeaders())
    return response.data.quota
  }
}

export default Neutron
