import ApiService from 'api-client/ApiService'
import { Host } from './resmgr.model'
import { trackApiMethodMetadata } from './helpers'

class ResMgr extends ApiService {
  public getClassName() {
    return 'resmgr'
  }

  static apiMethodsMetadata = []

  protected async getEndpoint() {
    const endpoint = await this.client.keystone.getServiceEndpoint('resmgr', 'internal')
    return `${endpoint}/v1`
  }

  @trackApiMethodMetadata({ url: '/hosts', type: 'GET' })
  async getHosts() {
    const url = `/hosts`
    return this.client.basicGet<Host[]>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getHosts',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/hosts/{hostId}/roles/{role}',
    type: 'PUT',
    params: ['hostId', 'role'],
  })
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

  @trackApiMethodMetadata({
    url: '/hosts/{hostId}/roles/{role}',
    type: 'DELETE',
    params: ['hostId', 'role'],
  })
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

  @trackApiMethodMetadata({
    url: '/hosts/{hostId}/roles/{role}',
    type: 'GET',
    params: ['hostId', 'role'],
  })
  async getRole<T>(hostId, role) {
    const url = `/hosts/${hostId}/roles/${role}`
    return this.client.basicGet<T>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRole',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/hosts/{hostId}',
    type: 'DELETE',
    params: ['hostId'],
  })
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

  @trackApiMethodMetadata({ url: '/services/{service}', type: 'GET', params: ['service'] })
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

  @trackApiMethodMetadata({
    url: '/services/{service}',
    type: 'PUT',
    params: ['service'],
  })
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
