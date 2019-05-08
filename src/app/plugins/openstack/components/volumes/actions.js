import { keyValueArrToObj, objToKeyValueArr } from 'app/utils/fp'
import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

export const loadVolumes = contextLoader('volumes', async ({ apiClient }) => {
  return apiClient.cinder.getVolumes()
})

export const updateVolume = async ({ setContext }) => {
  // TODO
}

export const loadVolumeTypes = contextLoader('volumeTypes', async ({ apiClient }) => {
  const volumeTypes = await apiClient.cinder.getVolumeTypes()

  // Change metadata into array form
  return (volumeTypes || []).map(x => ({ ...x, extra_specs: objToKeyValueArr(x.extra_specs) }))
})

export const loadVolumeSnapshots = contextLoader('volumeSnapshots', async ({ apiClient }) => {
  const volumeSnapshots = await apiClient.cinder.getSnapshots()

  // Change metadata into array form
  return (volumeSnapshots || []).map(x => ({
    ...x,
    metadata: objToKeyValueArr(x.metadata),
  }))
})

export const updateVolumeSnapshot = contextUpdater('volumeSnapshots', async ({ apiClient, currentItems, data }) => {
  const { id } = data
  const { cinder } = apiClient
  const updated = await cinder.updateSnapshot(id, data)
  cinder.updateSnapshotMetadata(id, keyValueArrToObj(data.metadata))
  updated.metadata = data.metadata
  return currentItems.map(x => x.id === id ? updated : x)
})

export const updateVolumeType = contextUpdater('volumeTypes', async ({ apiClient, currentItems, data }) => {
  const { id } = data
  const { cinder } = apiClient
  const converted = {
    name: data.name,
    extra_specs: keyValueArrToObj(data.extra_specs),
  }
  const oldKeys = currentItems.find(x => x.id === id).extra_specs.map(x => x.key)
  const newKeys = data.extra_specs.map(x => x.key)
  const keysToDelete = oldKeys.filter(x => !newKeys.includes(x))
  const updated = await cinder.updateVolumeType(id, converted, keysToDelete)
  return currentItems.map(x => x.id === id ? updated : x)
})

// TODO: update context?
export const createVolume = async ({ data, apiClient }) => {
  const { cinder } = apiClient
  const created = await cinder.createVolume(data)
  if (data.bootable) {
    await cinder.setBootable(created.id, true)
    created.bootable = true
  }
  return created
}
