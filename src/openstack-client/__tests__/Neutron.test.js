import {
  makeRegionedClient
} from '../helpers'

describe('Neutron', () => {
  let client
  jest.setTimeout(30000)

  beforeEach(async () => {
    client = await makeRegionedClient()
  })

  it('set region urls', async () => {
    const urls = await client.neutron.setRegionUrls()
    expect(urls).toBeDefined()
  })

  it('list networks', async () => {
    const networks = await client.neutron.getNetworks()
    expect(networks).toBeDefined()
  })

  it('list region networks', async () => {
    const networks = await client.neutron.getNetworksForRegion(client.activeRegion)
    expect(networks).toBeDefined()
  })

  it('create, get and delete a network placeholder', async () => {
    const network = await client.neutron.createNetwork({
      name: 'UITEST_TestNetwork'
    })
    expect(network.id).toBeDefined()

    const newNetwork = await client.neutron.getNetwork(network.id)
    expect(newNetwork).toBeDefined()

    await client.neutron.deleteNetwork(newNetwork.id)

    const newNetworks = await client.neutron.getNetworks()
    expect(newNetworks.find(x => x.id === newNetwork.id)).not.toBeDefined()
  })

  it('create, update and delete a network placeholder', async () => {
    const network = await client.neutron.createNetwork({
      name: 'UITEST_TestNetwork'
    })
    expect(network.id).toBeDefined()

    const updatedNetwork = await client.neutron.updateNetwork(network.id, {
      name: 'UITEST_UpdatedNetwork'
    })
    expect(updatedNetwork.name).toBe('UITEST_UpdatedNetwork')

    await client.neutron.deleteNetwork(updatedNetwork.id)

    const newNetworks = await client.neutron.getNetworks()
    expect(newNetworks.find(x => x.id === updatedNetwork.id)).not.toBeDefined()
  })

  it('get subnets', async () => {
    const subnets = await client.neutron.getSubnets()
    expect(subnets).toBeDefined()
  })

  it('create, update and delete a subnet placeholder', async () => {
    client = await makeRegionedClient()
    const network = await client.neutron.createNetwork({
      name: 'UITEST_TestNetwork'
    })
    const subnet = await client.neutron.createSubnet({
      name: 'UITEST_TestSubnet',
      ip_version: 4,
      cidr: '10.0.3.0/24',
      network_id: network.id
    })
    const updatedSubnet = await client.neutron.updateSubnet(subnet.id, {
      name: 'UITEST_UpdatedSubnet'
    })
    expect(updatedSubnet.name).toBe('UITEST_UpdatedSubnet')
    await client.neutron.deleteSubnet(updatedSubnet.id)
    await client.neutron.deleteNetwork(network.id)
    const subnets = await client.neutron.getSubnets()
    expect(subnets.find(x => x.id === updatedSubnet.id)).not.toBeDefined()
  })

  it('get ports', async () => {
    const ports = await client.neutron.getPorts()
    expect(ports).toBeDefined()
  })

  it('create, update and delete a port placeholder', async () => {
    const network = await client.neutron.createNetwork({
      name: 'UITEST_TestNetwork'
    })
    const port = await client.neutron.createPort({
      name: 'UITEST_TestPort',
      network_id: network.id
    })
    const updatedPort = await client.neutron.updatePort(port.id, {
      name: 'UITEST_UpdatedPort'
    })
    expect(updatedPort.name).toBe('UITEST_UpdatedPort')
    await client.neutron.deletePort(updatedPort.id)
    await client.neutron.deleteNetwork(network.id)
    const ports = await client.neutron.getPorts()
    expect(ports.find(x => x.id === updatedPort.id)).not.toBeDefined()
  })

  it('get floatingips', async () => {
    const floatingips = await client.neutron.getFloatingIps()
    expect(floatingips).toBeDefined()
  })

  // TODO: This test will probably fail on AWS.
  it('create, remove and delete a floatingip placeholder', async () => {
    const network = await client.neutron.createNetwork({
      name: 'UITEST_TestNetwork',
      'router:external': true
    })
    const subnet = await client.neutron.createSubnet({
      name: 'UITEST_TestSubnet',
      ip_version: 4,
      cidr: '10.0.3.0/24',
      network_id: network.id
    })
    const floatingip = await client.neutron.createFloatingIp({
      floating_network_id: network.id
    })
    const updatedFloatingIp = await client.neutron.removeFloatingIp(floatingip.id)
    expect(updatedFloatingIp.port_id).toBe(null)
    await client.neutron.deleteFloatingIp(updatedFloatingIp.id)
    await client.neutron.deleteSubnet(subnet.id)
    await client.neutron.deleteNetwork(network.id)
  })

  it('get network ip availability', async () => {
    const network = await client.neutron.createNetwork({
      name: 'UITEST_TestNetwork'
    })
    const networkIpAvailability = await client.neutron.networkIpAvailability(network.id)
    expect(networkIpAvailability).toBeDefined()
    await client.neutron.deleteNetwork(network.id)
  })

  it('get security groups', async () => {
    const securityGroups = await client.neutron.getSecurityGroups()
    expect(securityGroups).toBeDefined()
  })

  it('create, update and delete a security group placeholder', async () => {
    const securityGroup = await client.neutron.createSecurityGroup({
      name: 'UITEST_TestSecurityGroup'
    })
    expect(securityGroup.id).toBeDefined()
    const updatedSecurityGroup = await client.neutron.updateSecurityGroup(securityGroup.id, {
      name: 'UITEST_UpdatedSecurityGroup'
    })
    expect(updatedSecurityGroup.name).toBe('UITEST_UpdatedSecurityGroup')
    await client.neutron.deleteSecurityGroup(updatedSecurityGroup.id)
    const securityGroups = await client.neutron.getSecurityGroups()
    expect(securityGroups.find(x => x.id === updatedSecurityGroup.id)).not.toBeDefined()
  })

  it('get security group rules', async () => {
    const securityGroupRules = await client.neutron.getSecurityGroupRules()
    expect(securityGroupRules).toBeDefined()
  })

  it('create and delete a security group rule placeholder', async () => {
    const securityGroup = await client.neutron.createSecurityGroup({
      name: 'UITEST_TestSecurityGroupRule'
    })
    const securityGroupRule = await client.neutron.createSecurityGroupRule({
      direction: 'ingress',
      security_group_id: securityGroup.id
    })
    expect(securityGroupRule.id).toBeDefined()
    await client.neutron.deleteSecurityGroupRule(securityGroupRule.id)
    await client.neutron.deleteSecurityGroup(securityGroup.id)
    const securityGroupRules = await client.neutron.getSecurityGroupRules()
    expect(securityGroupRules.find(x => x.id === securityGroupRule.id)).not.toBeDefined()
  })

  it('get routers', async () => {
    const routers = await client.neutron.getRouters()
    expect(routers).toBeDefined()
  })

  it('create, update and delete a router placeholder', async () => {
    const router = await client.neutron.createRouter({
      name: 'UITEST_TestRouter'
    })
    expect(router.id).toBeDefined()
    const updatedRouter = await client.neutron.updateRouter(router.id, {
      name: 'UITEST_UpdatedRouter'
    })
    expect(updatedRouter.name).toBe('UITEST_UpdatedRouter')
    await client.neutron.deleteRouter(updatedRouter.id)
    const routers = await client.neutron.getRouters()
    expect(routers.find(x => x.id === updatedRouter.id)).not.toBeDefined()
  })

  it('create and delete an interface placeholder', async () => {
    const network = await client.neutron.createNetwork({
      name: 'UITEST_TestInterface'
    })
    const subnet = await client.neutron.createSubnet({
      name: 'UITEST_TestSubnet',
      ip_version: 4,
      cidr: '10.0.3.0/24',
      network_id: network.id
    })
    const port = await client.neutron.createPort({
      name: 'UITEST_TestPort',
      network_id: network.id
    })
    const router = await client.neutron.createRouter({
      name: 'UITEST_TestRouter'
    })
    const iface = await client.neutron.addInterface(router.id, {
      port_id: port.id
    })
    expect(iface).toBeDefined()
    await client.neutron.removeInterface(router.id, {
      port_id: port.id
    })
    await client.neutron.deleteRouter(router.id)
    await client.neutron.deleteSubnet(subnet.id)
    await client.neutron.deleteNetwork(network.id)
  })

  it('get all quotas', async () => {
    const quotas = await client.neutron.getAllQuotas()
    expect(quotas).toBeDefined()
  })

  it('get project quota', async () => {
    const projectId = (await client.keystone.getProjects())[0].id
    const quota = await client.neutron.getProjectQuota(projectId)
    expect(quota).toBeDefined()
  })

  it('get project quota for region', async () => {
    const projectId = (await client.keystone.getProjects())[0].id
    const quota = await client.neutron.getProjectQuotaForRegion(projectId, client.activeRegion)
    expect(quota).toBeDefined()
  })

  it('get default quota for region', async () => {
    const quota = await client.neutron.getDefaultQuotasForRegion(client.activeRegion)
    expect(quota).toBeDefined()
  })

  it('set quota and restore it', async () => {
    const projectId = (await client.keystone.getProjects())[0].id
    const originValue = (await client.neutron.getProjectQuota(projectId)).network
    const updatedQuota = await client.neutron.setQuotas(projectId, {
      network: originValue + 1
    })
    expect(updatedQuota.network).toBe(originValue + 1)
    await client.neutron.setQuotas(projectId, {
      network: originValue
    })
  })

  it('set quota for region and restore it', async () => {
    const projectId = (await client.keystone.getProjects())[0].id
    const originValue = (await client.neutron.getProjectQuotaForRegion(projectId, client.activeRegion)).network
    const updatedQuota = await client.neutron.setQuotasForRegion(projectId, client.activeRegion, {
      network: originValue + 1
    })
    expect(updatedQuota.network).toBe(originValue + 1)
    await client.neutron.setQuotasForRegion(projectId, client.activeRegion, {
      network: originValue
    })
  })
})
