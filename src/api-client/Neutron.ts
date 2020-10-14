import ApiService from 'api-client/ApiService'

class Neutron extends ApiService {
  public getClassName() {
    return 'neutron'
  }

  protected async getEndpoint() {
    return this.client.keystone.getServiceEndpoint('neutron', 'admin')
  }

  networkUrl = () => `/v2.0/networks`

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
    const url = `${this.networkUrl()}/${id}`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getNetwork',
      },
    })
    return response.network
  }

  async getNetworks() {
    const url = this.networkUrl()
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getNetworks',
      },
    })
    return response.networks
  }

  async getNetworksForRegion(region) {
    const endpoint = `${(await this.setRegionUrls())[region]}`
    const response = await this.client.basicGet<any>({
      url: '/networks',
      endpoint,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getNetworksForRegion',
      },
    })
    return response.networks
  }

  async createNetwork(params) {
    const url = this.networkUrl()
    const response = await this.client.basicPost<any>({
      url,
      body: {
        network: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'createNetwork',
      },
    })
    return response.network
  }

  async deleteNetwork(id) {
    const url = `${this.networkUrl()}/${id}`
    const response = await this.client.basicDelete<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteNetwork',
      },
    })
    return response.network
  }

  async updateNetwork(id, params) {
    const url = `${this.networkUrl()}/${id}`
    const response = await this.client.basicPut<any>({
      url,
      body: {
        network: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateNetwork',
      },
    })
    return response.network
  }

  async getSubnets() {
    const url = `/v2.0/subnets`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getSubnets',
      },
    })
    return response.subnets
  }

  async createSubnet(params) {
    const url = `/v2.0/subnets`
    const response = await this.client.basicPost<any>({
      url,
      body: {
        subnet: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'createSubnet',
      },
    })
    return response.subnet
  }

  async deleteSubnet(id) {
    const url = `/v2.0/subnets/${id}`
    await this.client.basicDelete<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteSubnet',
      },
    })
  }

  async updateSubnet(id, params) {
    const url = `/v2.0/subnets/${id}`
    const response = await this.client.basicPut<any>({
      url,
      body: {
        subnet: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateSubnet',
      },
    })
    return response.subnet
  }

  async getPorts() {
    const url = `/v2.0/ports`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getPorts',
      },
    })
    return response.ports
  }

  async createPort(params) {
    const url = `/v2.0/ports`
    const response = await this.client.basicPost<any>({
      url,
      body: {
        port: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'createPort',
      },
    })
    return response.port
  }

  async deletePort(id) {
    const url = `/v2.0/ports/${id}`
    await this.client.basicDelete<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deletePort',
      },
    })
  }

  async updatePort(id, params) {
    const url = `/v2.0/ports/${id}`
    const response = await this.client.basicPut<any>({
      url,
      body: { port: params },
      options: {
        clsName: this.getClassName(),
        mthdName: 'updatePort',
      },
    })
    return response.port
  }

  async getFloatingIps() {
    const url = `/v2.0/floatingips`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getFloatingIps',
      },
    })
    return response.floatingips
  }

  async createFloatingIp(params) {
    const url = `/v2.0/floatingips`
    const response = await this.client.basicPost<any>({
      url,
      body: {
        floatingip: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'createFloatingIp',
      },
    })
    return response.floatingip
  }

  async detachFloatingIp(id) {
    const url = `/v2.0/floatingips/${id}`
    const response = await this.client.basicPut<any>({
      url,
      body: {
        floatingip: { port_id: null },
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'detachFloatingIp',
      },
    })
    return response.floatingip
  }

  async deleteFloatingIp(id) {
    const url = `/v2.0/floatingips/${id}`
    return this.client.basicDelete<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteFloatingIp',
      },
    })
  }

  async networkIpAvailability(id) {
    const url = `/v2.0/network-ip-availabilities/${id}`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'networkIpAvailability',
      },
    })
    return response.network_ip_availability
  }

  async getSecurityGroups() {
    const url = `/v2.0/security-groups`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getSecurityGroups',
      },
    })
    return response.security_groups
  }

  async createSecurityGroup(params) {
    const url = `/v2.0/security-groups`
    const response = await this.client.basicPost<any>({
      url,
      body: {
        security_group: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'createSecurityGroup',
      },
    })
    return response.security_group
  }

  async updateSecurityGroup(id, params) {
    const url = `/v2.0/security-groups/${id}`
    const response = await this.client.basicPut<any>({
      url,
      body: {
        security_group: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateSecurityGroup',
      },
    })
    return response.security_group
  }

  async deleteSecurityGroup(id) {
    const url = `/v2.0/security-groups/${id}`
    await this.client.basicDelete<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteSecurityGroup',
      },
    })
  }

  async getSecurityGroupRules() {
    const url = `/v2.0/security-group-rules`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getSecurityGroupRules',
      },
    })
    return response.security_group_rules
  }

  async createSecurityGroupRule(params) {
    const url = `/v2.0/security-group-rules`
    const response = await this.client.basicPost<any>({
      url,
      body: {
        security_group_rule: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'createSecurityGroupRule',
      },
    })
    return response.security_group_rule
  }

  async deleteSecurityGroupRule(id) {
    const url = `/v2.0/security-group-rules/${id}`
    await this.client.basicDelete<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteSecurityGroupRule',
      },
    })
  }

  async getRouters() {
    const url = `/v2.0/routers`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRouters',
      },
    })
    return response.routers
  }

  async createRouter(params) {
    const url = `/v2.0/routers`
    const response = await this.client.basicPost<any>({
      url,
      body: {
        router: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'createRouter',
      },
    })
    return response.router
  }

  async updateRouter(id, params) {
    const url = `/v2.0/routers/${id}`
    const response = await this.client.basicPut<any>({
      url,
      body: {
        router: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateRouter',
      },
    })
    return response.router
  }

  async deleteRouter(id) {
    const url = `/v2.0/routers/${id}`
    await this.client.basicDelete<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteRouter',
      },
    })
  }

  async addInterface(id, body) {
    const url = `/v2.0/routers/${id}/add_router_interface`
    const response = await this.client.basicPut<any>({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addInterface',
      },
    })
    return response.data
  }

  async removeInterface(routerId, body) {
    const url = `/v2.0/routers/${routerId}/remove_router_interface`
    const response = await this.client.basicPut<any>({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'removeInterface',
      },
    })
    return response.data
  }

  async getAllQuotas() {
    const url = `/v2.0/quotas`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getAllQuotas',
      },
    })
    return response.quotas
  }

  async getProjectQuota(id) {
    const url = `/v2.0/quotas/${id}`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getProjectQuota',
      },
    })
    return response.quota
  }

  async getProjectQuotaForRegion(id, region) {
    const endpoint = `${(await this.setRegionUrls())[region]}`
    const url = `/quotas/${id}`
    const response = await this.client.basicGet<any>({
      endpoint,
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getProjectQuotaForRegion',
      },
    })
    return response.quota
  }

  async getDefaultQuotasForRegion(region) {
    const projectId = (await this.client.keystone.getProjects())[0]
    const endpoint = `${(await this.setRegionUrls())[region]}`
    const url = `/quotas/${projectId}`
    const response = await this.client.basicGet<any>({
      endpoint,
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getDefaultQuotasForRegion',
      },
    })
    return response.quota
  }

  async setQuotas(projectId, params) {
    const url = `/v2.0/quotas/${projectId}`
    const response = await this.client.basicPut<any>({
      url,
      body: {
        quota: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'setQuotas',
      },
    })
    return response.quota
  }

  async setQuotasForRegion(projectId, region, params) {
    const endpoint = `${(await this.setRegionUrls())[region]}`
    const url = `/quotas/${projectId}`
    const response = await this.client.basicPut<any>({
      endpoint,
      url,
      body: {
        quota: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'setQuotasForRegion',
      },
    })
    return response.quota
  }
}

export default Neutron
