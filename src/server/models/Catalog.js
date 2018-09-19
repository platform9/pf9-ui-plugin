import uuid from 'uuid'
const config = require('../../../config')

const fakeTenantId = uuid.v4()

const Catalog = {
  getCatalog: () => {
    return [
      {
        endpoints: [
          {
            id: uuid.v4(),
            interface: 'admin',
            region: config.region,
            region_id: config.region,
            url: `${config.apiHost}/neutron`
          },
          {
            id: uuid.v4(),
            interface: 'internal',
            region: config.region,
            region_id: config.region,
            url: `${config.apiHost}/neutron`
          },
          {
            id: uuid.v4(),
            interface: 'public',
            region: config.region,
            region_id: config.region,
            url: `${config.apiHost}/neutron`
          }
        ],
        id: uuid.v4(),
        name: 'neutron',
        type: 'network'
      },
      {
        endpoints: [
          {
            id: uuid.v4(),
            interface: 'admin',
            region: config.region,
            region_id: config.region,
            url: `${config.apiHost}/nova/v2.1/${fakeTenantId}`
          },
          {
            id: uuid.v4(),
            interface: 'internal',
            region: config.region,
            region_id: config.region,
            url: `${config.apiHost}/nova/v2.1/${fakeTenantId}`
          },
          {
            id: uuid.v4(),
            interface: 'public',
            region: config.region,
            region_id: config.region,
            url: `${config.apiHost}/nova/v2.1/${fakeTenantId}`
          }
        ],
        id: uuid.v4(),
        name: 'nova',
        type: 'compute'
      },
      {
        endpoints: [
          {
            id: uuid.v4(),
            interface: 'admin',
            region: config.region,
            region_id: config.region,
            url: `${config.apiHost}/cinder/v3/${fakeTenantId}`
          },
          {
            id: uuid.v4(),
            interface: 'internal',
            region: config.region,
            region_id: config.region,
            url: `${config.apiHost}/cinder/v3/${fakeTenantId}`
          },
          {
            id: uuid.v4(),
            interface: 'public',
            region: config.region,
            region_id: config.region,
            url: `${config.apiHost}/cinder/v3/${fakeTenantId}`
          }
        ],
        id: uuid.v4(),
        name: 'cinderv3',
        type: 'volumev3'
      }
    ]
  }
}

export default Catalog
