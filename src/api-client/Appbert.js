// Appbert provides information about clusters and the managed apps (packages) installed on them.
class Appbert {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.appbert.admin.url
    return endpoint
  }

  baseUrl = async () => `${await this.endpoint()}`

  async getClusterTags () {
    return this.client.basicGet(`${await this.baseUrl()}/clusters`)
  }
}

export default Appbert
