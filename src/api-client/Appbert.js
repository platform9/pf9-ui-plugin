// Appbert provides information about clusters and the managed apps (packages) installed on them.
class Appbert {
  constructor (client) {
    this.client = client
  }

  endpoint = async () => {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.appbert.admin.url
    return endpoint
  }

  baseUrl = async () => `${await this.endpoint()}`

  getClusterTags = async () => {
    return this.client.basicGet(`${await this.baseUrl()}/clusters`)
  }
}

export default Appbert
