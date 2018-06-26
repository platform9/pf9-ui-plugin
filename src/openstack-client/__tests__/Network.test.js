import {
  makeRegionedClient
} from '../helpers'

describe('Networks', () => {
  jest.setTimeout(30000)

  it('set region urls', async () => {
    const client = await makeRegionedClient()
    const urls = await client.network.setRegionUrls()
    expect(urls).toBeDefined()
  })

  it('list networks', async () => {
    const client = await makeRegionedClient()
    const networks = await client.network.getNetworks()
    expect(networks).toBeDefined()
  })

  it('list region networks', async () => {
    const client = await makeRegionedClient()
    const networks = await client.network.getNetworksForRegion(client.activeRegion)
    expect(networks).toBeDefined()
  })

  it('create, get and delete a network placeholder', async () => {
    const client = await makeRegionedClient()
    const network = await client.network.createNetwork({})
    expect(network.id).toBeDefined()

    const newNetwork = await client.network.getNetwork(network.id)
    expect(newNetwork).toBeDefined()

    await client.network.deleteNetwork(newNetwork.id)

    const newNetworks = await client.network.getNetworks()
    expect(newNetworks.find(x => x.id === newNetwork.id)).not.toBeDefined()
  })

  it('create, update and delete a network placeholder', async () => {
    const client = await makeRegionedClient()
    const network = await client.network.createNetwork({})
    expect(network.id).toBeDefined()

    const updatedNetwork = await client.network.updateNetwork(network.id, {
      name: 'New Name'
    })
    expect(updatedNetwork.name).toBe('New Name')

    await client.network.deleteNetwork(updatedNetwork.id)

    const newNetworks = await client.network.getNetworks()
    expect(newNetworks.find(x => x.id === updatedNetwork.id)).not.toBeDefined()
  })

  it('get subnets', async () => {
    const client = await makeRegionedClient()
    const subnets = await client.network.getSubnets()
    expect(subnets).toBeDefined()
  })

  it('create, update and delete a subnet placeholder', async () => {
    const client = await makeRegionedClient()
    const network = await client.network.createNetwork({
      name: 'To Test Subnet'
    })
    const subnet = await client.network.createSubnet({
      name: 'Test Subnet',
      ip_version: 4,
      cidr: '10.0.3.0/24',
      network_id: network.id
    })
    const updatedSubnet = await client.network.updateSubnet(subnet.id, {
      name: 'Updated Test Subnet'
    })
    expect(updatedSubnet.name).toBe('Updated Test Subnet')
    await client.network.deleteSubnet(updatedSubnet.id)
    await client.network.deleteNetwork(network.id)
  })

  it('get ports', async () => {
    const client = await makeRegionedClient()
    const ports = await client.network.getPorts()
    expect(ports).toBeDefined()
  })

  it('create, update and delete a port placeholder', async () => {
    const client = await makeRegionedClient()
    const network = await client.network.createNetwork({
      name: 'To Test Port'
    })
    const port = await client.network.createPort({
      name: 'Test Port',
      network_id: network.id
    })
    const updatedPort = await client.network.updatePort(port.id, {
      name: 'Updated Test Port'
    })
    expect(updatedPort.name).toBe('Updated Test Port')
    await client.network.deletePort(updatedPort.id)
    await client.network.deleteNetwork(network.id)
  })
})
