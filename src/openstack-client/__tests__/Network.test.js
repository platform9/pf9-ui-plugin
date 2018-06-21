import {
  makeRegionedClient
} from '../helpers'

describe('Networks', () => {
  it('list networks', async () => {
    const client = await makeRegionedClient()
    const networks = await client.network.getNetworks()
    expect(networks).toBeDefined()
  })

  it('create, get and delete a network placeholder', async () => {
    const client = await makeRegionedClient()
    const network = await client.network.createNetwork({
      'name': 'Test Network',
      'tenant_id': 'Test Tenant ID',
      'admin_state_up': true,
      'shared': true,
      'router:external': false
    })
    expect(network.id).toBeDefined()

    const newNetwork = await client.network.getNetwork(network.id)
    expect(newNetwork).toBeDefined()

    await client.network.deleteNetwork(newNetwork.id)

    const newNetworks = await client.network.getNetworks()
    expect(newNetworks.find(x => x.id === newNetwork.id)).not.toBeDefined()
  })

  it('create, update and delete a network placeholder', async () => {
    const client = await makeRegionedClient()
    const network = await client.network.createNetwork({
      'name': 'To Be Changed',
      'tenant_id': 'Test Tenant ID',
      'admin_state_up': true,
      'shared': true,
      'router:external': false
    })
    expect(network.id).toBeDefined()

    const updatedNetwork = await client.network.updateNetwork(network.id, {
      name: 'New Name'
    })
    expect(updatedNetwork.name).toBe('New Name')

    await client.network.deleteNetwork(updatedNetwork.id)

    const newNetworks = await client.network.getNetworks()
    expect(newNetworks.find(x => x.id === updatedNetwork.id)).not.toBeDefined()
  })
})
