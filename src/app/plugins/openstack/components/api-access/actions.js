/* eslint-disable key-spacing */
// which endpoint to use for each service (internal, public, admin)
const serviceMappings = {
  aodh:       'internal',
  azmanager:  'admin',
  ceilometer: 'internal',
  cinder:     'internal',
  credsmgr:   'admin',
  glance:     'admin',
  gnocchi:    'internal',
  ironic:     'public',
  mors:       'internal',
  murano:     'internal',
  neutron:    'internal',
  nova:       'internal',
  panko:      'internal',
  qbert:      'internal',
  resmgr:     'internal',
  tasker:     'admin',
}

const whichInterface = serviceName => serviceMappings[serviceName] || 'internal'

export const loadServiceCatalog = async ({ context, setContext, reload }) => {
  if (!reload && context.serviceCatalog) { return context.serviceCatalog }
  const services = await context.apiClient.keystone.getServicesForActiveRegion()
  const serviceCatalog = Object.keys(services).map(x => {
    const service = services[x]
    const iface = whichInterface(service)
    const endpoint = (service && service[iface]) || service[Object.keys(service)[0]]
    return {
      id: endpoint.id,
      name: x,
      type: endpoint.type,
      url: endpoint.url,
      iface: endpoint.iface,
    }
  })
  setContext({ serviceCatalog })
  return serviceCatalog
}
