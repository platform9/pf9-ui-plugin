import ApiClient from 'api-client/ApiClient'
import { keyValueArrToObj, objToKeyValueArr } from 'app/utils/fp'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'

export const loadVolumes = createContextLoader('volumes', async () => {
  const { cinder } = ApiClient.getInstance()
  return cinder.getVolumes()
})

export const createVolume = createContextUpdater('volumes', async data => {
  const { cinder } = ApiClient.getInstance()
  const created = await cinder.createVolume(data)
  if (data.bootable) {
    await cinder.setBootable(created.id, true)
    created.bootable = true
  }
  return created
}, { operation: 'create' })

export const updateVolume = createContextUpdater('volumes', async () => {
  // TODO
}, { operation: 'update' })

export const loadVolumeTypes = createContextLoader('volumeTypes', async () => {
  const { cinder } = ApiClient.getInstance()
  const volumeTypes = await cinder.getVolumeTypes()

  // Change metadata into array form
  return (volumeTypes || []).map(x => ({ ...x, extra_specs: objToKeyValueArr(x.extra_specs) }))
})

export const updateVolumeType = createContextUpdater('volumeTypes', async (data, currentItems) => {
  const { cinder } = ApiClient.getInstance()
  const { id } = data
  const converted = {
    name: data.name,
    extra_specs: keyValueArrToObj(data.extra_specs),
  }
  const oldKeys = currentItems.find(x => x.id === id).extra_specs.map(x => x.key)
  const newKeys = data.extra_specs.map(x => x.key)
  const keysToDelete = oldKeys.filter(x => !newKeys.includes(x))
  return cinder.updateVolumeType(id, converted, keysToDelete)
}, { operation: 'update' })

export const loadVolumeSnapshots = createContextLoader('volumeSnapshots', async () => {
  const { cinder } = ApiClient.getInstance()
  const volumeSnapshots = await cinder.getSnapshots()

  // Change metadata into array form
  return (volumeSnapshots || []).map(volumeSnapshot => ({
    ...volumeSnapshot,
    metadata: objToKeyValueArr(volumeSnapshot.metadata),
  }))
})

export const updateVolumeSnapshot = createContextUpdater('volumeSnapshots', async data => {
  const { cinder } = ApiClient.getInstance()
  const { id } = data
  const updated = await cinder.updateSnapshot(id, data)
  await cinder.updateSnapshotMetadata(id, keyValueArrToObj(data.metadata))
  return {
    ...updated,
    metadata: data.metadata,
  }
}, { operation: 'update' })
