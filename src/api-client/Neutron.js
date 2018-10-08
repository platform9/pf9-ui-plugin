import axios from 'axios'

class Neutron {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.neutron.admin.url
    return endpoint
  }

  networkUrl = async () => `${await this.endpoint()}/v2.0/networks`

  async setRegionUrls () {
    const services = (await this.client.keystone.getServiceCatalog()).find(x => x.name === 'neutron').endpoints
    const baseUrlsByRegion = services.reduce((accum, service) => {
      accum[service.region] = service.url + '/v2.0'
      return accum
    }, {})
    return baseUrlsByRegion
  }

  async getNetwork (id) {
    const url = `${await this.networkUrl()}/${id}`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.network
  }

  async getNetworks () {
    const url = await this.networkUrl()
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.networks
    } catch (err) {
      console.log(err)
    }
  }

  async getNetworksForRegion (region) {
    const url = `${(await this.setRegionUrls())[region]}/networks`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.networks
    } catch (err) {
      console.log(err)
    }
  }

  async createNetwork (params) {
    const url = await this.networkUrl()
    try {
      const response = await axios.post(url, { network: params }, this.client.getAuthHeaders())
      return response.data.network
    } catch (err) {
      console.log(err)
    }
  }

  async deleteNetwork (id) {
    const url = `${await this.networkUrl()}/${id}`
    try {
      const response = await axios.delete(url, this.client.getAuthHeaders())
      return response.data.network
    } catch (err) {
      console.log(err)
    }
  }

  async updateNetwork (id, params) {
    const url = `${await this.networkUrl()}/${id}`
    try {
      const response = await axios.put(url, { network: params }, this.client.getAuthHeaders())
      return response.data.network
    } catch (err) {
      console.log(err)
    }
  }

  async getSubnets () {
    const url = `${await this.endpoint()}/v2.0/subnets`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.subnets
    } catch (err) {
      console.log(err)
    }
  }

  async createSubnet (params) {
    const url = `${await this.endpoint()}/v2.0/subnets`
    try {
      const response = await axios.post(url, { subnet: params }, this.client.getAuthHeaders())
      return response.data.subnet
    } catch (err) {
      console.log(err)
    }
  }

  async deleteSubnet (id) {
    const url = `${await this.endpoint()}/v2.0/subnets/${id}`
    try {
      await axios.delete(url, this.client.getAuthHeaders())
    } catch (err) {
      console.log(err)
    }
  }

  async updateSubnet (id, params) {
    const url = `${await this.endpoint()}/v2.0/subnets/${id}`
    try {
      const response = await axios.put(url, { subnet: params }, this.client.getAuthHeaders())
      return response.data.subnet
    } catch (err) {
      console.log(err)
    }
  }

  async getPorts () {
    const url = `${await this.endpoint()}/v2.0/ports`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.ports
    } catch (err) {
      console.log(err)
    }
  }

  async createPort (params) {
    const url = `${await this.endpoint()}/v2.0/ports`
    try {
      const response = await axios.post(url, { port: params }, this.client.getAuthHeaders())
      return response.data.port
    } catch (err) {
      console.log(err)
    }
  }

  async deletePort (id) {
    const url = `${await this.endpoint()}/v2.0/ports/${id}`
    try {
      await axios.delete(url, this.client.getAuthHeaders())
    } catch (err) {
      console.log(err)
    }
  }

  async updatePort (id, params) {
    const url = `${await this.endpoint()}/v2.0/ports/${id}`
    try {
      const response = await axios.put(url, { port: params }, this.client.getAuthHeaders())
      return response.data.port
    } catch (err) {
      console.log(err)
    }
  }

  async getFloatingIps () {
    const url = `${await this.endpoint()}/v2.0/floatingips`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.floatingips
    } catch (err) {
      console.log(err)
    }
  }

  async createFloatingIp (params) {
    const url = `${await this.endpoint()}/v2.0/floatingips`
    try {
      const response = await axios.post(url, { floatingip: params }, this.client.getAuthHeaders())
      return response.data.floatingip
    } catch (err) {
      console.log(err)
    }
  }

  async removeFloatingIp (id) {
    const url = `${await this.endpoint()}/v2.0/floatingips/${id}`
    try {
      const response = await axios.put(url, { floatingip: { port_id: null } }, this.client.getAuthHeaders())
      return response.data.floatingip
    } catch (err) {
      console.log(err)
    }
  }

  async deleteFloatingIp (id) {
    const url = `${await this.endpoint()}/v2.0/floatingips/${id}`
    try {
      await axios.delete(url, this.client.getAuthHeaders())
    } catch (err) {
      console.log(err)
    }
  }

  async networkIpAvailability (id) {
    const url = `${await this.endpoint()}/v2.0/network-ip-availabilities/${id}`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.network_ip_availability
    } catch (err) {
      console.log(err)
    }
  }

  async getSecurityGroups () {
    const url = `${await this.endpoint()}/v2.0/security-groups`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.security_groups
    } catch (err) {
      console.log(err)
    }
  }

  async createSecurityGroup (params) {
    const url = `${await this.endpoint()}/v2.0/security-groups`
    try {
      const response = await axios.post(url, { security_group: params }, this.client.getAuthHeaders())
      return response.data.security_group
    } catch (err) {
      console.log(err)
    }
  }

  async updateSecurityGroup (id, params) {
    const url = `${await this.endpoint()}/v2.0/security-groups/${id}`
    try {
      const response = await axios.put(url, { security_group: params }, this.client.getAuthHeaders())
      return response.data.security_group
    } catch (err) {
      console.log(err)
    }
  }

  async deleteSecurityGroup (id) {
    const url = `${await this.endpoint()}/v2.0/security-groups/${id}`
    try {
      await axios.delete(url, this.client.getAuthHeaders())
    } catch (err) {
      console.log(err)
    }
  }

  async getSecurityGroupRules () {
    const url = `${await this.endpoint()}/v2.0/security-group-rules`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.security_group_rules
    } catch (err) {
      console.log(err)
    }
  }

  async createSecurityGroupRule (params) {
    const url = `${await this.endpoint()}/v2.0/security-group-rules`
    try {
      const response = await axios.post(url, { security_group_rule: params }, this.client.getAuthHeaders())
      return response.data.security_group_rule
    } catch (err) {
      console.log(err)
    }
  }

  async deleteSecurityGroupRule (id) {
    const url = `${await this.endpoint()}/v2.0/security-group-rules/${id}`
    try {
      await axios.delete(url, this.client.getAuthHeaders())
    } catch (err) {
      console.log(err)
    }
  }

  async getRouters () {
    const url = `${await this.endpoint()}/v2.0/routers`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.routers
    } catch (err) {
      console.log(err)
    }
  }

  async createRouter (params) {
    const url = `${await this.endpoint()}/v2.0/routers`
    try {
      const response = await axios.post(url, { router: params }, this.client.getAuthHeaders())
      return response.data.router
    } catch (err) {
      console.log(err)
    }
  }

  async updateRouter (id, params) {
    const url = `${await this.endpoint()}/v2.0/routers/${id}`
    try {
      const response = await axios.put(url, { router: params }, this.client.getAuthHeaders())
      return response.data.router
    } catch (err) {
      console.log(err)
    }
  }

  async deleteRouter (id) {
    const url = `${await this.endpoint()}/v2.0/routers/${id}`
    try {
      await axios.delete(url, this.client.getAuthHeaders())
    } catch (err) {
      console.log(err)
    }
  }

  async addInterface (id, params) {
    const url = `${await this.endpoint()}/v2.0/routers/${id}/add_router_interface`
    try {
      const response = await axios.put(url, params, this.client.getAuthHeaders())
      return response.data
    } catch (err) {
      console.log(err)
    }
  }

  async removeInterface (routerId, params) {
    const url = `${await this.endpoint()}/v2.0/routers/${routerId}/remove_router_interface`
    try {
      const response = await axios.put(url, params, this.client.getAuthHeaders())
      return response.data
    } catch (err) {
      console.log(err)
    }
  }

  async getAllQuotas () {
    const url = `${await this.endpoint()}/v2.0/quotas`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.quotas
    } catch (err) {
      console.log(err)
    }
  }

  async getProjectQuota (id) {
    const url = `${await this.endpoint()}/v2.0/quotas/${id}`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.quota
    } catch (err) {
      console.log(err)
    }
  }

  async getProjectQuotaForRegion (id, region) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/quotas/${id}`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.quota
    } catch (err) {
      console.log(err)
    }
  }

  async getDefaultQuotasForRegion (region) {
    const projectId = (await this.client.keystone.getProjects())[0]
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/quotas/${projectId}`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.quota
    } catch (err) {
      console.log(err)
    }
  }

  async setQuotas (projectId, params) {
    const url = `${await this.endpoint()}/v2.0/quotas/${projectId}`
    try {
      const response = await axios.put(url, { quota: params }, this.client.getAuthHeaders())
      return response.data.quota
    } catch (err) {
      console.log(err)
    }
  }

  async setQuotasForRegion (projectId, region, params) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/quotas/${projectId}`
    try {
      const response = await axios.put(url, { quota: params }, this.client.getAuthHeaders())
      return response.data.quota
    } catch (err) {
      console.log(err)
    }
  }
}

export default Neutron
