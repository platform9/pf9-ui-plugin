// Appbert provides information about clusters and the managed apps (packages) installed on them.
import ApiService from 'api-client/ApiService'

class Appbert extends ApiService {
  endpoint = () => {
    return this.client.keystone.getServiceEndpoint('appbert', 'admin')
  }

  baseUrl = async () => `${await this.endpoint()}`

  getClusterTags = async () => {
    return this.client.basicGet(`${await this.baseUrl()}/clusters`)
  }

  getPackages = async () => {
    return this.client.basicGet(`${await this.baseUrl()}/packages`)
  }

  toggleAddon = async (clusterUuid, pkgId, on) => {
    if (on) {
      return this.client.basicPut(`${await this.baseUrl()}/clusters/${clusterUuid}/${pkgId}`)
    }
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterUuid}/${pkgId}`)
  }
}

export default Appbert
