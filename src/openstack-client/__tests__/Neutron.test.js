import {
  makeRegionedClient
} from '../helpers'

describe('Neutron', () => {
  jest.setTimeout(30000)

  it('set region urls', async () => {
    const client = await makeRegionedClient()
    const urls = await client.neutron.setRegionUrls()
    expect(urls).toBeDefined()
  })

  it('list networks', async () => {
    const client = await makeRegionedClient()
    const networks = await client.neutron.getNetworks()
    expect(networks).toBeDefined()
  })

  it('list region networks', async () => {
    const client = await makeRegionedClient()
    const networks = await client.neutron.getNetworksForRegion(client.activeRegion)
    expect(networks).toBeDefined()
  })

  it('create, get and delete a network placeholder', async () => {
    const client = await makeRegionedClient()
    const network = await client.neutron.createNetwork({})
    expect(network.id).toBeDefined()

    const newNetwork = await client.neutron.getNetwork(network.id)
    expect(newNetwork).toBeDefined()

    await client.neutron.deleteNetwork(newNetwork.id)

    const newNetworks = await client.neutron.getNetworks()
    expect(newNetworks.find(x => x.id === newNetwork.id)).not.toBeDefined()
  })

  it('create, update and delete a network placeholder', async () => {
    const client = await makeRegionedClient()
    const network = await client.neutron.createNetwork({})
    expect(network.id).toBeDefined()

    const updatedNetwork = await client.neutron.updateNetwork(network.id, {
      name: 'New Name'
    })
    expect(updatedNetwork.name).toBe('New Name')

    await client.neutron.deleteNetwork(updatedNetwork.id)

    const newNetworks = await client.neutron.getNetworks()
    expect(newNetworks.find(x => x.id === updatedNetwork.id)).not.toBeDefined()
  })

  it('get subnets', async () => {
    const client = await makeRegionedClient()
    const subnets = await client.neutron.getSubnets()
    expect(subnets).toBeDefined()
  })

  it('create, update and delete a subnet placeholder', async () => {
    const client = await makeRegionedClient()
    const network = await client.neutron.createNetwork({
      name: 'To Test Subnet'
    })
    const subnet = await client.neutron.createSubnet({
      name: 'Test Subnet',
      ip_version: 4,
      cidr: '10.0.3.0/24',
      network_id: network.id
    })
    const updatedSubnet = await client.neutron.updateSubnet(subnet.id, {
      name: 'Updated Test Subnet'
    })
    expect(updatedSubnet.name).toBe('Updated Test Subnet')
    await client.neutron.deleteSubnet(updatedSubnet.id)
    await client.neutron.deleteNetwork(network.id)
  })

  it('get ports', async () => {
    const client = await makeRegionedClient()
    const ports = await client.neutron.getPorts()
    expect(ports).toBeDefined()
  })

  it('create, update and delete a port placeholder', async () => {
    const client = await makeRegionedClient()
    const network = await client.neutron.createNetwork({
      name: 'To Test Port'
    })
    const port = await client.neutron.createPort({
      name: 'Test Port',
      network_id: network.id
    })
    const updatedPort = await client.neutron.updatePort(port.id, {
      name: 'Updated Test Port'
    })
    expect(updatedPort.name).toBe('Updated Test Port')
    await client.neutron.deletePort(updatedPort.id)
    await client.neutron.deleteNetwork(network.id)
  })
})
