import {
  makeRegionedClient,
  waitUntil,
  sleep
} from '../helpers'

describe('Volumes', () => {
  // It will take some for a newly created/deleted volume
  // to change status if working on real DUs.
  jest.setTimeout(30000)

  it('list volumes', async () => {
    const client = await makeRegionedClient()
    const volumes = await client.volume.getVolumes()
    expect(volumes).toBeDefined()
  })

  it.only('create, get and delete a volume placeholder', async () => {
    const client = await makeRegionedClient()
    const volume = await client.volume.createVolume({
      name: 'FeelFreeToDelete',
      size: 1,
      metadata: {}
    })
    expect(volume.id).toBeDefined()

    const newVolume = await client.volume.getVolume(volume.id)
    expect(newVolume).toBeDefined()

    waitUntil(client.volume.checkForCreate, newVolume.id, 1000, 20)
    const newVolumes = await client.volume.getVolumes()
    console.log(newVolumes)

    // // Wait for new volume's status changing to 'available'
    // await client.volume.waitForCreate(1000, 20, newVolume.id)
    // await client.volume.deleteVolume(newVolume.id)

    // await client.volume.waitForDelete(1000, 20, newVolume.id)
    // const newVolumes = await client.volume.getVolumes()
    // expect(newVolumes.find(x => x.id === newVolume.id)).not.toBeDefined()
  })

  it('create and update a volume, then delete it', async () => {
    const client = await makeRegionedClient()
    const volume = await client.volume.createVolume({
      name: 'ToBeChanged',
      size: 1,
      metadata: {}
    })
    expect(volume.id).toBeDefined()

    const updatedVolume = await client.volume.updateVolume(volume.id, {
      name: 'NewName'
    })
    expect(updatedVolume.name).toBe('NewName')

    // Wait for new volume's status changing to 'available'
    await client.volume.waitForCreate(1000, 20, updatedVolume.id)

    await client.volume.deleteVolume(updatedVolume.id)

    await client.volume.waitForDelete(1000, 20, updatedVolume.id)
    const newVolumes = await client.volume.getVolumes()
    expect(newVolumes.find(x => x.id === updatedVolume.id)).not.toBeDefined()
  })
})
