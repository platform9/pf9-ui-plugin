import { makeRegionedClient } from '../helpers'

describe('Qbert', async () => {
  const second = 1000
  jest.setTimeout(10 * second)

  let client

  beforeEach(async () => {
    client = await makeRegionedClient('service')
  })

  it('list cloud providers', async () => {
    const providers = await client.qbert.getCloudProviders()
    expect(providers).toBeDefined()
  })

  it('list cloud provider types', async () => {
    const types = await client.qbert.getCloudProviderTypes()
    expect(types).toBeDefined()
  })

  it('list clusters', async () => {
    const clusters = await client.qbert.getClusters()
    expect(clusters).toBeDefined()
  })
})
