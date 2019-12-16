import ApiClient from 'api-client/ApiClient'
import { keyValueArrToObj, objToKeyValueArr } from 'app/utils/fp'
import createCRUDActions from 'core/helpers/createCRUDActions'

const { cinder } = ApiClient.getInstance()

export const volumesCacheKey = 'volumes'
export const volumeTypesCacheKey = 'volumeTypes'
export const volumeSnapshotsCacheKey = 'volumeSnapshots'

export const volumeActions = createCRUDActions(volumesCacheKey, {
  listFn: async () => {
    return cinder.getVolumes()
  },
  createFn: async data => {
    const created = await cinder.createVolume(data)
    if (data.bootable) {
      await cinder.setBootable(created.id, true)
      created.bootable = true
    }
    return created
  },
  deleteFn: async ({ id }) => {
    await cinder.deleteVolume(id)
  }
})

export const volumeTypeActions = createCRUDActions(volumeTypesCacheKey, {
  listFn: async () => {
    const volumeTypes = await cinder.getVolumeTypes()

    // Change metadata into array form
    return (volumeTypes || []).map(x => ({ ...x, extra_specs: objToKeyValueArr(x.extra_specs) }))
  },
  createFn: async data => {
    return cinder.createVolumeType({
      name: data.name,
      extra_specs: keyValueArrToObj(data.metadata),
    })
  },
  updateFn: async (data, currentItems) => {
    const { id } = data
    const converted = {
      name: data.name,
      extra_specs: keyValueArrToObj(data.extra_specs),
    }
    const oldKeys = currentItems.find(x => x.id === id).extra_specs.map(x => x.key)
    const newKeys = data.extra_specs.map(x => x.key)
    const keysToDelete = oldKeys.filter(x => !newKeys.includes(x))
    return cinder.updateVolumeType(id, converted, keysToDelete)
  },
  deleteVolumeType: async ({ id }) => {
    await cinder.deleteVolumeType(id)
  }
})

export const volumeSnapshotActions = createCRUDActions(volumeSnapshotsCacheKey, {
  listFn: async () => {
    const volumeSnapshots = await cinder.getSnapshots()

    // Change metadata into array form
    return (volumeSnapshots || []).map(volumeSnapshot => ({
      ...volumeSnapshot,
      metadata: objToKeyValueArr(volumeSnapshot.metadata),
    }))
  },
  updateFn: async data => {
    const { id } = data
    const updated = await cinder.updateSnapshot(id, data)
    await cinder.updateSnapshotMetadata(id, keyValueArrToObj(data.metadata))
    return {
      ...updated,
      metadata: data.metadata,
    }
  },
  createFn: async ({ volumeId, name, description }) => {
    if (!volumeId) { throw new Error('Invalid volumeId') }

    return cinder.snapshotVolume({
      volume_id: volumeId,
      name,
      description,
    })
  },
  deleteFn: async ({ id }) => {
    await cinder.deleteSnapshot(id)
  }
})
