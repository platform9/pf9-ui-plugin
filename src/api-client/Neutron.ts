import ApiService from 'api-client/ApiService'

class Neutron extends ApiService {
  clsName = 'neutron'
  async endpoint() {
    return this.client.keystone.getServiceEndpoint('neutron', 'admin')
  }

  networkUrl = async () => `${await this.endpoint()}/v2.0/networks`

  async setRegionUrls() {
    const services = (await this.client.keystone.getServiceCatalog()).find(
      (x) => x.name === 'neutron',
    ).endpoints
    return services.reduce((accum, service) => {
      accum[service.region] = `${service.url}/v2.0`
      return accum
    }, {})
  }

  async getNetwork(id) {
    const url = `${await this.networkUrl()}/${id}`
    const response = await this.client.basicGet('Neutron', 'getNetwork', url)
    return response.network
  }

  async getNetworks() {
    const url = await this.networkUrl()
    const response = await this.client.basicGet('Neutron', 'getNetworks', url)
    return response.networks
  }

  async getNetworksForRegion(region) {
    const url = `${(await this.setRegionUrls())[region]}/networks`
    const response = await this.client.basicGet('Neutron', 'getNetworksForRegion', url)
    return response.networks
  }

  async createNetwork(params) {
    const url = await this.networkUrl()
    const response = await this.client.basicPost('Neutron', 'createNetwork', url, {
      network: params,
    })
    return response.network
  }

  async deleteNetwork(id) {
    const url = `${await this.networkUrl()}/${id}`
    const response = await this.client.basicDelete('Neutron', 'deleteNetwork', url)
    return response.network
  }

  async updateNetwork(id, params) {
    const url = `${await this.networkUrl()}/${id}`
    const response = await this.client.basicPut('Neutron', 'updateNetwork', url, {
      network: params,
    })
    return response.network
  }

  async getSubnets() {
    const url = `${await this.endpoint()}/v2.0/subnets`
    const response = await this.client.basicGet('Neutron', 'getSubnets', url)
    return response.subnets
  }

  async createSubnet(params) {
    const url = `${await this.endpoint()}/v2.0/subnets`
    const response = await this.client.basicPost('Neutron', 'createSubnet', url, { subnet: params })
    return response.subnet
  }

  async deleteSubnet(id) {
    const url = `${await this.endpoint()}/v2.0/subnets/${id}`
    await this.client.basicDelete('Neutron', 'deleteSubnet', url)
  }

  async updateSubnet(id, params) {
    const url = `${await this.endpoint()}/v2.0/subnets/${id}`
    const response = await this.client.basicPut('Neutron', 'updateSubnet', url, { subnet: params })
    return response.subnet
  }

  async getPorts() {
    const url = `${await this.endpoint()}/v2.0/ports`
    const response = await this.client.basicGet('Neutron', 'getPorts', url)
    return response.ports
  }

  async createPort(params) {
    const url = `${await this.endpoint()}/v2.0/ports`
    const response = await this.client.basicPost('Neutron', 'createPort', url, { port: params })
    return response.port
  }

  async deletePort(id) {
    const url = `${await this.endpoint()}/v2.0/ports/${id}`
    await this.client.basicDelete('Neutron', 'deletePort', url)
  }

  async updatePort(id, params) {
    const url = `${await this.endpoint()}/v2.0/ports/${id}`
    const response = await this.client.basicPut('Neutron', 'updatePort', url, { port: params })
    return response.port
  }

  async getFloatingIps() {
    const url = `${await this.endpoint()}/v2.0/floatingips`
    const response = await this.client.basicGet('Neutron', 'getFloatingIps', url)
    return response.floatingips
  }

  async createFloatingIp(params) {
    const url = `${await this.endpoint()}/v2.0/floatingips`
    const response = await this.client.basicPost('Neutron', 'createFloatingIp', url, {
      floatingip: params,
    })
    return response.floatingip
  }

  async detachFloatingIp(id) {
    const url = `${await this.endpoint()}/v2.0/floatingips/${id}`
    const response = await this.client.basicPut('Neutron', 'detachFloatingIp', url, {
      floatingip: { port_id: null },
    })
    return response.floatingip
  }

  async deleteFloatingIp(id) {
    const url = `${await this.endpoint()}/v2.0/floatingips/${id}`
    await this.client.basicDelete('Neutron', 'deleteFloatingIp', url)
  }

  async networkIpAvailability(id) {
    const url = `${await this.endpoint()}/v2.0/network-ip-availabilities/${id}`
    const response = await this.client.basicGet('Neutron', 'networkIpAvailability', url)
    return response.network_ip_availability
  }

  async getSecurityGroups() {
    const url = `${await this.endpoint()}/v2.0/security-groups`
    const response = await this.client.basicGet('Neutron', 'getSecurityGroups', url)
    return response.security_groups
  }

  async createSecurityGroup(params) {
    const url = `${await this.endpoint()}/v2.0/security-groups`
    const response = await this.client.basicPost('Neutron', 'createSecurityGroup', url, {
      security_group: params,
    })
    return response.security_group
  }

  async updateSecurityGroup(id, params) {
    const url = `${await this.endpoint()}/v2.0/security-groups/${id}`
    const response = await this.client.basicPut('Neutron', 'updateSecurityGroup', url, {
      security_group: params,
    })
    return response.security_group
  }

  async deleteSecurityGroup(id) {
    const url = `${await this.endpoint()}/v2.0/security-groups/${id}`
    await this.client.basicDelete('Neutron', 'deleteSecurityGroup', url)
  }

  async getSecurityGroupRules() {
    const url = `${await this.endpoint()}/v2.0/security-group-rules`
    const response = await this.client.basicGet('Neutron', 'getSecurityGroupRules', url)
    return response.security_group_rules
  }

  async createSecurityGroupRule(params) {
    const url = `${await this.endpoint()}/v2.0/security-group-rules`
    const response = await this.client.basicPost('Neutron', 'createSecurityGroupRule', url, {
      security_group_rule: params,
    })
    return response.security_group_rule
  }

  async deleteSecurityGroupRule(id) {
    const url = `${await this.endpoint()}/v2.0/security-group-rules/${id}`
    await this.client.basicDelete('Neutron', 'deleteSecurityGroupRule', url)
  }

  async getRouters() {
    const url = `${await this.endpoint()}/v2.0/routers`
    const response = await this.client.basicGet('Neutron', 'getRouters', url)
    return response.routers
  }

  async createRouter(params) {
    const url = `${await this.endpoint()}/v2.0/routers`
    const response = await this.client.basicPost('Neutron', 'createRouter', url, { router: params })
    return response.router
  }

  async updateRouter(id, params) {
    const url = `${await this.endpoint()}/v2.0/routers/${id}`
    const response = await this.client.basicPut('Neutron', 'updateRouter', url, { router: params })
    return response.router
  }

  async deleteRouter(id) {
    const url = `${await this.endpoint()}/v2.0/routers/${id}`
    await this.client.basicDelete('Neutron', 'deleteRouter', url)
  }

  async addInterface(id, params) {
    const url = `${await this.endpoint()}/v2.0/routers/${id}/add_router_interface`
    const response = await this.client.basicPut('Neutron', 'addInterface', url, params)
    return response.data
  }

  async removeInterface(routerId, params) {
    const url = `${await this.endpoint()}/v2.0/routers/${routerId}/remove_router_interface`
    const response = await this.client.basicPut('Neutron', 'removeInterface', url, params)
    return response.data
  }

  async getAllQuotas() {
    const url = `${await this.endpoint()}/v2.0/quotas`
    const response = await this.client.basicGet('Neutron', 'getAllQuotas', url)
    return response.quotas
  }

  async getProjectQuota(id) {
    const url = `${await this.endpoint()}/v2.0/quotas/${id}`
    const response = await this.client.basicGet('Neutron', 'getProjectQuota', url)
    return response.quota
  }

  async getProjectQuotaForRegion(id, region) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/quotas/${id}`
    const response = await this.client.basicGet('Neutron', 'getProjectQuotaForRegion', url)
    return response.quota
  }

  async getDefaultQuotasForRegion(region) {
    const projectId = (await this.client.keystone.getProjects())[0]
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/quotas/${projectId}`
    const response = await this.client.basicGet('Neutron', 'getDefaultQuotasForRegion', url)
    return response.quota
  }

  async setQuotas(projectId, params) {
    const url = `${await this.endpoint()}/v2.0/quotas/${projectId}`
    const response = await this.client.basicPut('Neutron', 'setQuotas', url, { quota: params })
    return response.quota
  }

  async setQuotasForRegion(projectId, region, params) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/quotas/${projectId}`
    const response = await this.client.basicPut('Neutron', 'setQuotasForRegion', url, {
      quota: params,
    })
    return response.quota
  }
}

export default Neutron
