// Appbert provides information about clusters and the managed apps (packages) installed on them.
import ApiService from 'api-client/ApiService'
import { ClusterTag } from './appbert.model'
import { trackApiMethodMetadata } from './helpers'

class Appbert extends ApiService {
  public getClassName() {
    return 'appbert'
  }

  static apiMethodsMetadata = []

  protected async getEndpoint() {
    return this.client.keystone.getServiceEndpoint('appbert', 'admin')
  }

  @trackApiMethodMetadata({ url: '/clusters', type: 'GET' })
  getClusterTags = async () => {
    // return this.client.basicGet(`${this.apiEndpoint}/clusters`)
    const data = await this.client.basicGet<ClusterTag[]>({
      url: '/clusters',
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterTags',
      },
    })
    // ApiCache.instance.cacheItem(this.getClassName(), 'getClusterTags', data)
    return data
  }

  @trackApiMethodMetadata({ url: '/packages', type: 'GET' })
  getPackages = async () => {
    // return this.client.basicGet(`${this.apiEndpoint}/packages`)
    const data = await this.client.basicGet({
      url: '/packages',
      options: {
        clsName: this.getClassName(),
        mthdName: 'getPackages',
      },
    })
    // ApiCache.instance.cacheItem(this.getClassName(), 'getPackages', data)
    return data
  }

  toggleAddon = async (clusterUuid, pkgId, on) => {
    if (on) {
      return this.addPkg(clusterUuid, pkgId)
    }
    return this.removePkg(clusterUuid, pkgId)
  }

  @trackApiMethodMetadata({
    url: '/clusters/:clusterUuid/:packageId',
    type: 'PUT',
    params: ['clusterUuid', 'packageId'],
  })
  addPkg = async (clusterUuid, pkgId) => {
    const data = await this.client.basicPut({
      url: `/clusters/${clusterUuid}/${pkgId}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addPkg',
      },
    })
    // ApiCache.instance.cacheItem(this.getClassName(), 'addPkg', data)
    return data
  }

  @trackApiMethodMetadata({
    url: '/clusters/:clusterUuid/:packageId',
    type: 'DELETE',
    params: ['clusterUuid', 'packageId'],
  })
  removePkg = async (clusterUuid, pkgId) => {
    const data = await this.client.basicDelete({
      url: `/clusters/${clusterUuid}/${pkgId}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'removePkg',
      },
    })
    // ApiCache.instance.cacheItem(this.getClassName(), 'addremovePkgPkg', data)
    return data
  }
}

export default Appbert
