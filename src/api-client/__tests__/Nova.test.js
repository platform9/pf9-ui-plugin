import {
  makeRegionedClient,
} from '../helpers'

describe('Nova', () => {
  let client
  beforeEach(async () => {
    client = await makeRegionedClient()
  })

  it('list flavors', async () => {
    const flavors = await client.nova.getFlavors()
    expect(flavors).toBeDefined()
    expect(flavors.length).toBeGreaterThan(1)
    expect(flavors[0].name).toBeDefined()
  })

  it('create flavor', async () => {
    const testFlavor = {
      name: 'test.deleteMe',
      ram: 512,
      disk: 1,
      vcpus: 1
    }
    const flavor = await client.nova.createFlavor(testFlavor)
    expect(flavor.id).toBeDefined()
  })

  it('delete flavor', async () => {
    const flavors = await client.nova.getFlavors()
    const toDelete = flavors.find(x => x.name === 'test.deleteMe')
    if (!toDelete || !toDelete.id) {
      throw new Error('Prior test flavor not found.  Unable to delete the test flavor.')
    }
    await client.nova.deleteFlavor(toDelete.id)
  })
})
