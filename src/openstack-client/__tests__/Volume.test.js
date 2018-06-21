import {
  makeRegionedClient,
  waitUntil
} from '../helpers'
import axios from 'axios'

describe('Volumes', async () => {
  // It will take some for a newly created/deleted volume
  // to change status if working on real DUs.
  jest.setTimeout(20000)

  it('list volumes', async () => {
    const client = await makeRegionedClient()
    const volumes = await client.volume.getVolumes()
    expect(volumes).toBeDefined()
  })

  it('create, get and delete a volume placeholder', async () => {
    const client = await makeRegionedClient()
    const volume = await client.volume.createVolume({
      name: 'FeelFreeToDelete',
      size: 1,
      metadata: {}
    })
    expect(volume.id).toBeDefined()

    const newVolume = await client.volume.getVolume(volume.id)
    expect(newVolume).toBeDefined()

    // Wait for new volume's status changing to 'available'
    await waitUntil({ condition: waitForCreate(newVolume.id), delay: 1000, maxRetries: 20 })
    await client.volume.deleteVolume(newVolume.id)

    // Wait for new volume is fully deleted
    await waitUntil({ condition: waitForDelete(newVolume.id), delay: 1000, maxRetries: 20 })
    const newVolumes = await client.volume.getVolumes()
    expect(newVolumes.find(x => x.id === newVolume.id)).not.toBeDefined()
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
    await waitUntil({ condition: waitForCreate(updatedVolume.id), delay: 1000, maxRetries: 20 })
    await client.volume.deleteVolume(updatedVolume.id)

    // Wait for new volume is fully deleted
    await waitUntil({ condition: waitForDelete(updatedVolume.id), delay: 1000, maxRetries: 20 })
    const newVolumes = await client.volume.getVolumes()
    expect(newVolumes.find(x => x.id === updatedVolume.id)).not.toBeDefined()
  })
})

const waitForCreate = params => async () => {
  const client = await makeRegionedClient()
  const services = await client.keystone.getServicesForActiveRegion()
  const url = `${services.cinderv3.admin.url}/volumes/${params}`
  let response = await axios.get(url, client.getAuthHeaders())
  let flag = (response.data.volume.status === 'available')
  return flag
}

const waitForDelete = params => async () => {
  const client = await makeRegionedClient()
  const services = await client.keystone.getServicesForActiveRegion()
  let flag = false
  const url = `${services.cinderv3.admin.url}/volumes/${params}`
  await axios.get(url, client.getAuthHeaders()).catch(function (error) {
    flag = error.response.status === 404
  })
  return flag
}
