import ApiClient from 'api-client/ApiClient'
import { keyValueArrToObj, objToKeyValueArr } from 'app/utils/fp'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'

const { cinder } = ApiClient.getInstance()

export const volumesCacheKey = 'volumes'
export const volumeTypesCacheKey = 'volumeTypes'
export const volumeSnapshotsCacheKey = 'volumeSnapshots'

export const loadVolumes = createContextLoader(volumesCacheKey, async () => {
  return cinder.getVolumes()
})

export const createVolume = createContextUpdater(
  volumesCacheKey,
  async (data) => {
    const created = await cinder.createVolume(data)
    if (data.bootable) {
      await cinder.setBootable(created.id, true)
      created.bootable = true
    }
    return created
  },
  { operation: 'create' },
)

export const updateVolume = createContextUpdater(
  volumesCacheKey,
  async () => {
    // TODO
  },
  { operation: 'update' },
)

export const loadVolumeTypes = createContextLoader(volumeTypesCacheKey, async () => {
  const volumeTypes = await cinder.getVolumeTypes()

  // Change metadata into array form
  return (volumeTypes || []).map((x) => ({ ...x, extra_specs: objToKeyValueArr(x.extra_specs) }))
})

export const updateVolumeType = createContextUpdater(
  volumeTypesCacheKey,
  async (data, currentItems) => {
    const { id } = data
    const converted = {
      name: data.name,
      extra_specs: keyValueArrToObj(data.extra_specs),
    }
    const oldKeys = currentItems.find((x) => x.id === id).extra_specs.map((x) => x.key)
    const newKeys = data.extra_specs.map((x) => x.key)
    const keysToDelete = oldKeys.filter((x) => !newKeys.includes(x))
    return cinder.updateVolumeType(id, converted, keysToDelete)
  },
  { operation: 'update' },
)

export const loadVolumeSnapshots = createContextLoader(volumeSnapshotsCacheKey, async () => {
  const volumeSnapshots = await cinder.getSnapshots()

  // Change metadata into array form
  return (volumeSnapshots || []).map((volumeSnapshot) => ({
    ...volumeSnapshot,
    metadata: objToKeyValueArr(volumeSnapshot.metadata),
  }))
})

export const updateVolumeSnapshot = createContextUpdater(
  volumeSnapshotsCacheKey,
  async (data) => {
    const { id } = data
    const updated = await cinder.updateSnapshot(id, data)
    await cinder.updateSnapshotMetadata(id, keyValueArrToObj(data.metadata))
    return {
      ...updated,
      metadata: data.metadata,
    }
  },
  { operation: 'update' },
)
