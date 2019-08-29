/* eslint-disable key-spacing */
// which endpoint to use for each service (internal, public, admin)
import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'

const serviceMappings = {
  aodh: 'internal',
  azmanager: 'admin',
  ceilometer: 'internal',
  cinder: 'internal',
  credsmgr: 'admin',
  glance: 'admin',
  gnocchi: 'internal',
  ironic: 'public',
  mors: 'internal',
  murano: 'internal',
  neutron: 'internal',
  nova: 'internal',
  panko: 'internal',
  qbert: 'internal',
  resmgr: 'internal',
  tasker: 'admin',
}

const { keystone } = ApiClient.getInstance()

const whichInterface = serviceName => serviceMappings[serviceName] || 'internal'

export const serviceCatalogContextKey = 'serviceCatalog'

export const loadServiceCatalog = createContextLoader(serviceCatalogContextKey, async () => {
  const services = await keystone.getServicesForActiveRegion()
  return Object.entries(services).map(([name, service]) => {
    const iface = whichInterface(service)
    const endpoint = (service && service[iface]) || service[Object.keys(service)[0]]
    return {
      id: endpoint.id,
      name,
      type: endpoint.type,
      url: endpoint.url,
      iface: endpoint.iface,
    }
  })
})
