import uuid from 'uuid'

const config = require('../../../../config')

const fakeTenantId = uuid.v4()

const createService = ({ name, type, url }) => {
  const createEndpoint = _interface => ({
    id: uuid.v4(),
    interface: _interface,
    region: config.region,
    region_id: config.region,
    url,
  })

  return {
    endpoints: ['admin', 'internal', 'public'].map(createEndpoint),
    id: uuid.v4(),
    name,
    type,
  }
}

const Catalog = {
  getCatalog: () => {
    const services = [
      { name: 'neutron', type: 'network', url: `${config.apiHost}/neutron` },
      { name: 'nova', type: 'compute', url: `${config.apiHost}/nova/v2.1/${fakeTenantId}` },
      { name: 'cinderv3', type: 'volumev3', url: `${config.apiHost}/cinder/v3/${fakeTenantId}` },
      { name: 'glance', type: 'image', url: `${config.apiHost}/glance` },
      { name: 'qbert', type: 'qbert', url: `${config.apiHost}/qbert/v1` },
      { name: 'monocular', type: 'monocular', url: `${config.apiHost}/monocular/v1` },
      { name: 'resmgr', type: 'resmgr', url: `${config.apiHost}/resmgr` },
      { name: 'appbert', type: 'Kubernetes App Management', url: `${config.apiHost}/appbert/v1` },
    ]
    return services.map(createService)
  },
}

export default Catalog
