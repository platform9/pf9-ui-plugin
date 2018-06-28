import {
  makeRegionedClient,
  waitUntil
} from '../helpers'
import axios from 'axios'

describe('Volumes', async () => {
  // It will take some for a newly created/deleted volume
  // to change status if working on real DUs.
  jest.setTimeout(30000)
  let client

  beforeEach(async () => {
    client = await makeRegionedClient()
  })

  it('list volumes', async () => {
    const volumes = await client.cinder.getVolumes()
    expect(volumes).toBeDefined()
  })

  it('list volumes of all tenants', async () => {
    const volumes = await client.cinder.getAllVolumes()
    expect(volumes).toBeDefined()
  })

  it('list volumes with params', async () => {
    const volumes = await client.cinder.getAllVolumesCount(500, true)
    expect(volumes).toBeDefined()
  })

  it('create, get and delete a volume placeholder', async () => {
    const volume = await client.cinder.createVolume({
      name: 'UITEST_TestVolume',
      size: 1
    })
    expect(volume.id).toBeDefined()

    const newVolume = await client.cinder.getVolume(volume.id)
    expect(newVolume).toBeDefined()

    // Wait for new volume's status changing to 'available'
    await waitUntil({ condition: waitForVolumeCreate(newVolume.id), delay: 1000, maxRetries: 20 })
    await client.cinder.deleteVolume(newVolume.id)

    // Wait for new volume is fully deleted
    await waitUntil({ condition: waitForVolumeDelete(newVolume.id), delay: 1000, maxRetries: 20 })
    const newVolumes = await client.cinder.getVolumes()
    expect(newVolumes.find(x => x.id === newVolume.id)).not.toBeDefined()
  })

  it('create and update a volume, then delete it', async () => {
    const volume = await client.cinder.createVolume({
      name: 'UITEST_TestVolume',
      size: 1
    })
    expect(volume.id).toBeDefined()

    const updatedVolume = await client.cinder.updateVolume(volume.id, {
      name: 'UITEST_UpdatedVolume'
    })
    expect(updatedVolume.name).toBe('UITEST_UpdatedVolume')

    // Wait for new volume's status changing to 'available'
    await waitUntil({ condition: waitForVolumeCreate(updatedVolume.id), delay: 1000, maxRetries: 20 })
    await client.cinder.deleteVolume(updatedVolume.id)

    // Wait for new volume is fully deleted
    await waitUntil({ condition: waitForVolumeDelete(updatedVolume.id), delay: 1000, maxRetries: 20 })
    const newVolumes = await client.cinder.getVolumes()
    expect(newVolumes.find(x => x.id === updatedVolume.id)).not.toBeDefined()
  })

  it('get volumetypes', async () => {
    const volumeTypes = await client.cinder.getVolumeTypes()
    expect(volumeTypes).toBeDefined()
  })

  it('create a volumetype placeholder and delete it', async () => {
    const numBefore = (await client.cinder.getVolumeTypes()).length
    await client.cinder.createVolumeType({
      name: 'UITEST_TestVolumeType'
    })
    let numAfter = (await client.cinder.getVolumeTypes()).length
    expect(numAfter).toBe(numBefore + 1)

    await client.cinder.deleteVolumeType((await client.cinder.getVolumeType('UITEST_TestVolumeType')).id)
    numAfter = (await client.cinder.getVolumeTypes()).length
    expect(numAfter).toBe(numBefore)
  })

  it('create, update and delete a volumetype placeholder', async () => {
    await client.cinder.createVolumeType({
      name: 'UITEST_TestVolumeType'
    })
    const id = (await client.cinder.getVolumeType('UITEST_TestVolumeType')).id
    const response = await client.cinder.updateVolumeType(id, {
      TestKey: 'UITEST_TestValue'
    })
    expect(response.TestKey).toBe('UITEST_TestValue')

    await client.cinder.deleteVolumeType(id)
  })

  it('create a volumetype placeholder, unset its volumetype tag, then delete it', async () => {
    await client.cinder.createVolumeType({
      name: 'UITEST_TestVolumeType',
      extra_specs: {
        TestKey: 'UITEST_TestValue'
      }
    })
    const id = (await client.cinder.getVolumeType('UITEST_TestVolumeType')).id
    await client.cinder.unsetVolumeTypeTag(id, 'TestKey')
    const updatedVolumeType = await client.cinder.getVolumeType('UITEST_TestVolumeType')
    expect(updatedVolumeType.extra_specs).toEqual({})

    await client.cinder.deleteVolumeType(id)
  })

  it('list snapshots', async () => {
    const snapshots = await client.cinder.getSnapshots()
    expect(snapshots).toBeDefined()
  })

  it('list snapshots of all tenants', async () => {
    const snapshots = await client.cinder.getAllSnapshots()
    expect(snapshots).toBeDefined()
  })

  it('Create a volume placeholder, snapshot it and delete both', async () => {
    const volume = await client.cinder.createVolume({
      name: 'UITEST_TestSnapshot',
      size: 1
    })

    await waitUntil({ condition: waitForVolumeCreate(volume.id), delay: 1000, maxRetries: 20 })
    const snapshot = await client.cinder.snapshotVolume({
      volume_id: volume.id,
      name: 'UITEST_TestSnapshot'
    })
    expect(snapshot.id).toBeDefined()

    await waitUntil({ condition: waitForSnapshotCreate(snapshot.id), delay: 1000, maxRetries: 20 })
    await client.cinder.deleteSnapshot(snapshot.id)

    await waitUntil({ condition: waitForSnapshotDelete(snapshot.id), delay: 1000, maxRetries: 20 })
    await client.cinder.deleteVolume(volume.id)
    await waitUntil({ condition: waitForVolumeDelete(volume.id), delay: 1000, maxRetries: 20 })
    const volumes = await client.cinder.getAllVolumes()
    expect(volumes.find(x => x.id === volume.id)).not.toBeDefined()
    const snapshots = await client.cinder.getAllSnapshots()
    expect(snapshots.find(x => x.id === snapshot.id)).not.toBeDefined()
  })

  it('change bootable status of a volume placeholder', async () => {
    const volume = await client.cinder.createVolume({
      name: 'UITEST_TestVolume',
      size: 1,
      bootable: false
    })
    await client.cinder.setBootable(volume.id, true)
    const newVolume = await client.cinder.getVolume(volume.id)
    expect(newVolume.bootable).toBe('true')

    await waitUntil({ condition: waitForVolumeCreate(volume.id), delay: 1000, maxRetries: 20 })
    await client.cinder.deleteVolume(newVolume.id)
    await waitUntil({ condition: waitForVolumeDelete(newVolume.id), delay: 1000, maxRetries: 20 })
  })

  it('Create a volume placeholder, snapshot and update the snapshot, then delete both', async () => {
    const volume = await client.cinder.createVolume({
      name: 'UITEST_TestVolume',
      size: 1
    })

    await waitUntil({ condition: waitForVolumeCreate(volume.id), delay: 1000, maxRetries: 20 })
    const snapshot = await client.cinder.snapshotVolume({
      volume_id: volume.id,
      name: 'UITEST_TestSnapshot'
    })

    await waitUntil({ condition: waitForSnapshotCreate(snapshot.id), delay: 1000, maxRetries: 20 })
    const updatedSnapshot = await client.cinder.updateSnapshot(snapshot.id, {
      name: 'UITEST_UpdatedSnapshot'
    })

    await waitUntil({ condition: waitForSnapshotCreate(updatedSnapshot.id), delay: 1000, maxRetries: 20 })
    expect(updatedSnapshot.name).toEqual('UITEST_UpdatedSnapshot')

    await client.cinder.deleteSnapshot(updatedSnapshot.id)
    await waitUntil({ condition: waitForSnapshotDelete(updatedSnapshot.id), delay: 1000, maxRetries: 20 })
    await client.cinder.deleteVolume(volume.id)
    await waitUntil({ condition: waitForVolumeDelete(volume.id), delay: 1000, maxRetries: 20 })
    const volumes = await client.cinder.getAllVolumes()
    expect(volumes.find(x => x.id === volume.id)).not.toBeDefined()
    const snapshots = await client.cinder.getAllSnapshots()
    expect(snapshots.find(x => x.id === updatedSnapshot.id)).not.toBeDefined()
  })

  it('Create a volume placeholder, snapshot and update metadata, then delete both', async () => {
    const volume = await client.cinder.createVolume({
      name: 'UITEST_TestVolume',
      size: 1
    })

    await waitUntil({ condition: waitForVolumeCreate(volume.id), delay: 1000, maxRetries: 20 })
    const snapshot = await client.cinder.snapshotVolume({
      volume_id: volume.id,
      name: 'UITEST_TestSnapShot'
    })

    await waitUntil({ condition: waitForSnapshotCreate(snapshot.id), delay: 1000, maxRetries: 20 })
    const updatedSnapshotMetadata = await client.cinder.updateSnapshotMetadata(snapshot.id, {
      TestKey: 'UITEST_TestValue'
    })
    expect(updatedSnapshotMetadata.TestKey).toEqual('UITEST_TestValue')

    await client.cinder.deleteSnapshot(snapshot.id)
    await waitUntil({ condition: waitForSnapshotDelete(snapshot.id), delay: 1000, maxRetries: 20 })
    await client.cinder.deleteVolume(volume.id)
    await waitUntil({ condition: waitForVolumeDelete(volume.id), delay: 1000, maxRetries: 20 })
    const volumes = await client.cinder.getAllVolumes()
    expect(volumes.find(x => x.id === volume.id)).not.toBeDefined()
    const snapshots = await client.cinder.getAllSnapshots()
    expect(snapshots.find(x => x.id === snapshot.id)).not.toBeDefined()
  })

  it('get region urls', async () => {
    const urls = await client.cinder.setRegionUrls()
    expect(urls).toBeDefined()
  })

  it('get default quotas', async () => {
    const quotas = await client.cinder.getDefaultQuotas()
    expect(quotas).toBeDefined()
  })

  it('get region default quotas', async () => {
    const quotas = await client.cinder.getDefaultQuotasForRegion(client.activeRegion)
    expect(quotas).toBeDefined()
  })

  it('get quotas', async () => {
    const projectId = (await client.keystone.getProjects())[0].id
    const quotas = await client.cinder.getQuotas(projectId)
    expect(quotas).toBeDefined()
  })

  it('get quotas for region', async () => {
    const projectId = (await client.keystone.getProjects())[0].id
    const quotas = await client.cinder.getQuotasForRegion(projectId, client.activeRegion)
    expect(quotas).toBeDefined()
  })

  it('set quotas', async () => {
    const projectId = (await client.keystone.getProjects())[0].id
    const oldValue = (await client.cinder.getQuotas(projectId)).groups.limit
    await client.cinder.setQuotas({
      groups: 10
    }, projectId)
    const newQuota = await client.cinder.getQuotas(projectId)
    expect(newQuota.groups.limit).toBe(10)
    await client.cinder.setQuotas({
      groups: oldValue
    }, projectId)
  })

  it('set quotas for region', async () => {
    const projectId = (await client.keystone.getProjects())[0].id
    const oldValue = (await client.cinder.getQuotasForRegion(projectId, client.activeRegion)).groups.limit
    await client.cinder.setQuotasForRegion({
      groups: 10
    }, projectId, client.activeRegion)
    const newQuota = await client.cinder.getQuotasForRegion(projectId, client.activeRegion)
    expect(newQuota.groups.limit).toBe(10)
    await client.cinder.setQuotasForRegion({
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
