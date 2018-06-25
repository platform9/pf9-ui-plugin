import uuid from 'uuid'

const fakeTenantId = uuid.v4()

const Catalog = {
  getCatalog: () => {
    return [
      {
        endpoints: [
          {
            id: uuid.v4(),
            interface: 'admin',
            region: 'master',
            region_id: 'master',
            url: '/neutron'
          },
          {
            id: uuid.v4(),
            interface: 'internal',
            region: 'master',
            region_id: 'master',
            url: '/neutron'
          },
          {
            id: uuid.v4(),
            interface: 'public',
            region: 'master',
            region_id: 'master',
            url: '/neutron'
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
            region: 'master',
            region_id: 'master',
            url: `/nova/v2.1/${fakeTenantId}`
          },
          {
            id: uuid.v4(),
            interface: 'internal',
            region: 'master',
            region_id: 'master',
            url: `/nova/v2.1/${fakeTenantId}`
          },
          {
            id: uuid.v4(),
            interface: 'public',
            region: 'master',
            region_id: 'master',
            url: `/nova/v2.1/${fakeTenantId}`
          }
        ],
        id: uuid.v4(),
        name: 'nova',
        type: 'compute'
      }
    ]
  }
}

export default Catalog
