// Appbert provides information about clusters and the managed apps (packages) installed on them.
import ApiService from 'api-client/ApiService'
import { ClusterTag } from './appbert.model'

class Appbert extends ApiService {
  protected getClassName() {
    return 'appbert'
  }

  protected async getEndpoint() {
    console.log(this.client)
    return this.client.keystone.getServiceEndpoint('appbert', 'admin')
  }

  getClusterTags = async () => {
    // return this.client.basicGet(`${this.apiEndpoint}/clusters`)
    const data = await this.client.basicGet<ClusterTag[]>(
      'Appbert',
      'getClusterTags',
      `${await this.getEndpoint()}/clusters`,
    )
    // ApiCache.instance.cacheItem('Appbert', 'getClusterTags', data)
    return data
  }

  getPackages = async () => {
    // return this.client.basicGet(`${this.apiEndpoint}/packages`)
    const data = await this.client.basicGet(
      'Appbert',
      'getPackages',
      `${await this.getEndpoint()}/packages`,
    )
    // ApiCache.instance.cacheItem('Appbert', 'getPackages', data)
    return data
  }

  toggleAddon = async (clusterUuid, pkgId, on) => {
    if (on) {
      return this.addPkg(clusterUuid, pkgId)
    }
    return this.removePkg(clusterUuid, pkgId)
  }

  addPkg = async (clusterUuid, pkgId) => {
    const data = await this.client.basicPut(
      'Appbert',
      'addPkg',
      `${await this.getEndpoint()}/clusters/${clusterUuid}/${pkgId}`,
    )
    // ApiCache.instance.cacheItem('Appbert', 'addPkg', data)
    return data
  }

  removePkg = async (clusterUuid, pkgId) => {
    const data = await this.client.basicDelete(
      'Appbert',
      'addPkg',
      `${await this.getEndpoint()}/clusters/${clusterUuid}/${pkgId}`,
    )
    // ApiCache.instance.cacheItem('Appbert', 'addremovePkgPkg', data)
    return data
  }
}

export default Appbert
