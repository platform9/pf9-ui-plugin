import { keyValueArrToObj, objToKeyValueArr } from 'app/utils/fp'
import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

export const loadVolumes = contextLoader('volumes', async ({ context }) => {
  return context.apiClient.cinder.getVolumes()
})

export const updateVolume = async ({ setContext }) => {
  // TODO
}

export const loadVolumeTypes = contextLoader('volumeTypes', async ({ context }) => {
  const volumeTypes = await context.apiClient.cinder.getVolumeTypes()

  // Change metadata into array form
  return (volumeTypes || []).map(x => ({ ...x, extra_specs: objToKeyValueArr(x.extra_specs) }))
})

export const loadVolumeSnapshots = contextLoader('volumeSnapshots', async ({ context }) => {
  const volumeSnapshots = await context.apiClient.cinder.getSnapshots()

  // Change metadata into array form
  return (volumeSnapshots || []).map(x => ({
    ...x,
    metadata: objToKeyValueArr(x.metadata),
  }))
})

export const updateVolumeSnapshot = contextUpdater('volumeSnapshots', async ({ data, context }) => {
  const { id } = data
  const { cinder } = context.apiClient
  const updated = await cinder.updateSnapshot(id, data)
  cinder.updateSnapshotMetadata(id, keyValueArrToObj(data.metadata))
  updated.metadata = data.metadata
  return context.volumeSnapshots.map(x => x.id === id ? updated : x)
})

export const updateVolumeType = contextUpdater('volumeTypes', async ({ data, context }) => {
  const { id } = data
  const { cinder } = context.apiClient
  const converted = {
    name: data.name,
    extra_specs: keyValueArrToObj(data.extra_specs),
  }
  const oldKeys = context.volumeTypes.find(x => x.id === id).extra_specs.map(x => x.key)
  const newKeys = data.extra_specs.map(x => x.key)
  const keysToDelete = oldKeys.filter(x => !newKeys.includes(x))
  const updated = await cinder.updateVolumeType(id, converted, keysToDelete)
  return context.volumeTypes.map(x => x.id === id ? updated : x)
})

// TODO: update context?
export const createVolume = async ({ data, context, setContext }) => {
  const { cinder } = context.apiClient
  const created = await cinder.createVolume(data)
  if (data.bootable) {
    await cinder.setBootable(created.id, true)
    created.bootable = true
  }
  return created
}
