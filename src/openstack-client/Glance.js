// import axios from 'axios'

class Glance {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const servicesForCurrentRegion = await this.client.getServicesForCurrentRegion()
    console.log(servicesForCurrentRegion)
    // It should have the endpoint from the catalog.  If not we need to populate it.
  }
}

export default Glance
