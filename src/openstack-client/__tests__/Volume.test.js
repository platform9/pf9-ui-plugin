import {
  makeRegionedClient,
  waitUntil
} from '../helpers'
import axios from 'axios'

describe('Volumes', async () => {
  // It will take some for a newly created/deleted volume
  // to change status if working on real DUs.
  jest.setTimeout(30000)

  it('list volumes', async () => {
    const client = await makeRegionedClient()
    const volumes = await client.volume.getVolumes()
    expect(volumes).toBeDefined()
  })

  it('list volumes of all tenants', async () => {
    const client = await makeRegionedClient()
    const volumes = await client.volume.getAllVolumes()
    expect(volumes).toBeDefined()
  })

  it('list volumes with params', async () => {
    const client = await makeRegionedClient()
    const volumes = await client.volume.getAllVolumesCount(500, true)
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
    await waitUntil({ condition: waitForVolumeCreate(newVolume.id), delay: 1000, maxRetries: 20 })
    await client.volume.deleteVolume(newVolume.id)

    // Wait for new volume is fully deleted
    await waitUntil({ condition: waitForVolumeDelete(newVolume.id), delay: 1000, maxRetries: 20 })
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
    await waitUntil({ condition: waitForVolumeCreate(updatedVolume.id), delay: 1000, maxRetries: 20 })
    await client.volume.deleteVolume(updatedVolume.id)

    // Wait for new volume is fully deleted
    await waitUntil({ condition: waitForVolumeDelete(updatedVolume.id), delay: 1000, maxRetries: 20 })
    const newVolumes = await client.volume.getVolumes()
    expect(newVolumes.find(x => x.id === updatedVolume.id)).not.toBeDefined()
  })

  it('get volumetypes', async () => {
    const client = await makeRegionedClient()
    const volumeTypes = await client.volume.getVolumeTypes()
    expect(volumeTypes).toBeDefined()
  })

  it('create a volumetype placeholder and delete it', async () => {
    const client = await makeRegionedClient()
    const numBefore = (await client.volume.getVolumeTypes()).length
    await client.volume.createVolumeType({
      name: 'Test VolumeType',
      description: 'Just a test volumetype',
      extra_specs: {}
    })
    let numAfter = (await client.volume.getVolumeTypes()).length
    expect(numAfter).toBe(numBefore + 1)

    await client.volume.deleteVolumeType((await client.volume.getVolumeType('Test VolumeType')).id)
    numAfter = (await client.volume.getVolumeTypes()).length
    expect(numAfter).toBe(numBefore)
  })

  it('create, update and delete a volumetype placeholder', async () => {
    const client = await makeRegionedClient()
    await client.volume.createVolumeType({
      name: 'Test VolumeType for Specs',
      description: 'Just a test volumetype',
      extra_specs: {}
    })
    const id = (await client.volume.getVolumeType('Test VolumeType for Specs')).id
    const response = await client.volume.updateVolumeType(id, {
      TestKey: 'TestValue'
    })
    expect(response.TestKey).toBe('TestValue')

    await client.volume.deleteVolumeType(id)
  })

  it('create a volumetype placeholder, unset its volumetype tag, then delete it', async () => {
    const client = await makeRegionedClient()
    await client.volume.createVolumeType({
      name: 'Test VolumeType for Tags',
      description: 'Just a test volumetype',
      extra_specs: {
        TestKey: 'TestValue'
      }
    })
    const id = (await client.volume.getVolumeType('Test VolumeType for Tags')).id
    await client.volume.unsetVolumeTypeTag(id, 'TestKey')
    const updatedVolumeType = await client.volume.getVolumeType('Test VolumeType for Tags')
    expect(updatedVolumeType.extra_specs).toEqual({})

    await client.volume.deleteVolumeType(id)
  })

  it('list snapshots', async () => {
    const client = await makeRegionedClient()
    const snapshots = await client.volume.getSnapshots()
    expect(snapshots).toBeDefined()
  })

  it('list snapshots of all tenants', async () => {
    const client = await makeRegionedClient()
    const snapshots = await client.volume.getAllSnapshots()
    expect(snapshots).toBeDefined()
  })

  it('Create a volume placeholder, snapshot it and delete both', async () => {
    const client = await makeRegionedClient()
    const volume = await client.volume.createVolume({
      name: 'Snapshot Test',
      size: 1,
      metadata: {}
    })

    await waitUntil({ condition: waitForVolumeCreate(volume.id), delay: 1000, maxRetries: 20 })
    const snapshot = await client.volume.snapshotVolume({
      volume_id: volume.id,
      name: 'Test Snapshot',
      description: 'Just for test'
    })
    expect(snapshot.id).toBeDefined()

    await waitUntil({ condition: waitForSnapshotCreate(snapshot.id), delay: 1000, maxRetries: 20 })
    await client.volume.deleteSnapshot(snapshot.id)

    await waitUntil({ condition: waitForSnapshotDelete(snapshot.id), delay: 1000, maxRetries: 20 })
    await client.volume.deleteVolume(volume.id)
    await waitUntil({ condition: waitForVolumeDelete(volume.id), delay: 1000, maxRetries: 20 })
    const volumes = await client.volume.getAllVolumes()
    expect(volumes.find(x => x.id === volume.id)).not.toBeDefined()
    const snapshots = await client.volume.getAllSnapshots()
    expect(snapshots.find(x => x.id === snapshot.id)).not.toBeDefined()
  })

  it('change bootable status of a volume placeholder', async () => {
    const client = await makeRegionedClient()
    const volume = await client.volume.createVolume({
      name: 'Bootable Update Test',
      size: 1,
      bootable: false,
      metadata: {}
    })
    await client.volume.setBootable(volume.id, true)
    const newVolume = await client.volume.getVolume(volume.id)
    expect(newVolume.bootable).toBe('true')

    await waitUntil({ condition: waitForVolumeCreate(volume.id), delay: 1000, maxRetries: 20 })
    await client.volume.deleteVolume(newVolume.id)
    await waitUntil({ condition: waitForVolumeDelete(newVolume.id), delay: 1000, maxRetries: 20 })
  })

  it('Create a volume placeholder, snapshot and update the snapshot, then delete both', async () => {
    const client = await makeRegionedClient()
    const volume = await client.volume.createVolume({
      name: 'Snapshot Update Test',
      size: 1,
      metadata: {}
    })

    await waitUntil({ condition: waitForVolumeCreate(volume.id), delay: 1000, maxRetries: 20 })
    const snapshot = await client.volume.snapshotVolume({
      volume_id: volume.id,
      name: 'Test Snapshot Update',
      description: 'Just for test'
    })

    await waitUntil({ condition: waitForSnapshotCreate(snapshot.id), delay: 1000, maxRetries: 20 })
    const updatedSnapshot = await client.volume.updateSnapshot(snapshot.id, {
      name: 'Renamed Snapshot'
    })

    await waitUntil({ condition: waitForSnapshotCreate(updatedSnapshot.id), delay: 1000, maxRetries: 20 })
    expect(updatedSnapshot.name).toEqual('Renamed Snapshot')

    await client.volume.deleteSnapshot(updatedSnapshot.id)
    await waitUntil({ condition: waitForSnapshotDelete(updatedSnapshot.id), delay: 1000, maxRetries: 20 })
    await client.volume.deleteVolume(volume.id)
    await waitUntil({ condition: waitForVolumeDelete(volume.id), delay: 1000, maxRetries: 20 })
    const volumes = await client.volume.getAllVolumes()
    expect(volumes.find(x => x.id === volume.id)).not.toBeDefined()
    const snapshots = await client.volume.getAllSnapshots()
    expect(snapshots.find(x => x.id === updatedSnapshot.id)).not.toBeDefined()
  })

  it('Create a volume placeholder, snapshot and update metadata, then delete both', async () => {
    const client = await makeRegionedClient()
    const volume = await client.volume.createVolume({
      name: 'Metadata Update Test',
      size: 1,
      metadata: {}
    })

    await waitUntil({ condition: waitForVolumeCreate(volume.id), delay: 1000, maxRetries: 20 })
    const snapshot = await client.volume.snapshotVolume({
      volume_id: volume.id,
      name: 'Test Metadata Update',
      description: 'Just for test'
    })

    await waitUntil({ condition: waitForSnapshotCreate(snapshot.id), delay: 1000, maxRetries: 20 })
    const updatedSnapshotMetadata = await client.volume.updateSnapshotMetadata(snapshot.id, {
      TestKey: 'TestValue'
    })
    expect(updatedSnapshotMetadata.TestKey).toEqual('TestValue')

    await client.volume.deleteSnapshot(snapshot.id)
    await waitUntil({ condition: waitForSnapshotDelete(snapshot.id), delay: 1000, maxRetries: 20 })
    await client.volume.deleteVolume(volume.id)
    await waitUntil({ condition: waitForVolumeDelete(volume.id), delay: 1000, maxRetries: 20 })
    const volumes = await client.volume.getAllVolumes()
    expect(volumes.find(x => x.id === volume.id)).not.toBeDefined()
    const snapshots = await client.volume.getAllSnapshots()
    expect(snapshots.find(x => x.id === snapshot.id)).not.toBeDefined()
  })

  it('get region urls', async () => {
    const client = await makeRegionedClient()
    const urls = await client.volume.setRegionUrls()
    expect(urls).toBeDefined()
  })

  it('get default quotas', async () => {
    const client = await makeRegionedClient()
    const quotas = await client.volume.getDefaultQuotas()
    expect(quotas).toBeDefined()
  })

  it('get region default quotas', async () => {
    const client = await makeRegionedClient()
    const quotas = await client.volume.getDefaultQuotasForRegion(client.activeRegion)
    expect(quotas).toBeDefined()
  })

  it('get quotas', async () => {
    const client = await makeRegionedClient()
    const projectId = (await client.keystone.getProjects())[0].id
    const quotas = await client.volume.getQuotas(projectId)
    expect(quotas).toBeDefined()
  })

  it('get quotas for region', async () => {
    const client = await makeRegionedClient()
    const projectId = (await client.keystone.getProjects())[0].id
    const quotas = await client.volume.getQuotasForRegion(projectId, client.activeRegion)
    expect(quotas).toBeDefined()
  })

  it('set quotas', async () => {
    const client = await makeRegionedClient()
    const projectId = (await client.keystone.getProjects())[0].id
    const oldValue = (await client.volume.getQuotas(projectId)).groups.limit
    await client.volume.setQuotas({
      groups: 10
    }, projectId)
    const newQuota = await client.volume.getQuotas(projectId)
    expect(newQuota.groups.limit).toBe(10)
    await client.volume.setQuotas({
      groups: oldValue
    }, projectId)
  })

  it('set quotas for region', async () => {
    const client = await makeRegionedClient()
    const projectId = (await client.keystone.getProjects())[0].id
    const oldValue = (await client.volume.getQuotasForRegion(projectId, client.activeRegion)).groups.limit
    await client.volume.setQuotasForRegion({
      groups: 10
    }, projectId, client.activeRegion)
    const newQuota = await client.volume.getQuotasForRegion(projectId, client.activeRegion)
    expect(newQuota.groups.limit).toBe(10)
    await client.volume.setQuotasForRegion({
      groups: oldValue
    }, projectId, client.activeRegion)
  })
})

const waitForVolumeCreate = params => async () => {
  const client = await makeRegionedClient()
  const services = await client.keystone.getServicesForActiveRegion()
  const url = `${services.cinderv3.admin.url}/volumes/${params}`
  let response = await axios.get(url, client.getAuthHeaders())
  let flag = (response.data.volume.status === 'available')
  return flag
}

const waitForVolumeDelete = params => async () => {
  const client = await makeRegionedClient()
  const services = await client.keystone.getServicesForActiveRegion()
  let flag = false
  const url = `${services.cinderv3.admin.url}/volumes/${params}`
  await axios.get(url, client.getAuthHeaders()).catch(function (error) {
    flag = error.response.status === 404
  })
  return flag
}

const waitForSnapshotCreate = params => async () => {
  const client = await makeRegionedClient()
  const services = await client.keystone.getServicesForActiveRegion()
  const url = `${services.cinderv3.admin.url}/snapshots/${params}`
  let response = await axios.get(url, client.getAuthHeaders())
  let flag = (response.data.snapshot.status === 'available')
  return flag
}

const waitForSnapshotDelete = params => async () => {
  const client = await makeRegionedClient()
  const services = await client.keystone.getServicesForActiveRegion()
  let flag = false
  const url = `${services.cinderv3.admin.url}/snapshots/${params}`
  await axios.get(url, client.getAuthHeaders()).catch(function (error) {
    flag = error.response.status === 404
  })
  return flag
}
