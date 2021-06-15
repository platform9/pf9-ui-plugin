import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import { keyValueArrToObj, objToKeyValueArr } from 'app/utils/fp'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { trackEvent } from 'utils/tracking'

const { cinder } = ApiClient.getInstance()

export const volumesCacheKey = 'volumes'
export const volumeTypesCacheKey = 'volumeTypes'
export const volumeSnapshotsCacheKey = 'volumeSnapshots'

export const volumeActions = createCRUDActions(volumesCacheKey, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get volumes')
    return cinder.getVolumes()
  },
  createFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to create volume', data)
    const created = await cinder.createVolume(data)
    if (data.bootable) {
      await cinder.setBootable(created.id, true)
      created.bootable = true
    }
    trackEvent('Volume Created', { id: created?.id })
    return created
  },
  deleteFn: async ({ id }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete volume', { id })
    await cinder.deleteVolume(id)
    trackEvent('Volume Deleted', { id })
  },
})

export const volumeTypeActions = createCRUDActions(volumeTypesCacheKey, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get volume types')
    const volumeTypes = await cinder.getVolumeTypes()

    // Change metadata into array form
    return (volumeTypes || []).map((x) => ({ ...x, extra_specs: objToKeyValueArr(x.extra_specs) }))
  },
  createFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to create volume type', data)
    trackEvent('Create Volume Type', { name: data.name })
    return cinder.createVolumeType({
      name: data.name,
      extra_specs: keyValueArrToObj(data.metadata),
    })
  },
  updateFn: async (data, currentItems) => {
    const { id } = data
    Bugsnag.leaveBreadcrumb('Attempting to update volume type', { id })
    const converted = {
      name: data.name,
      extra_specs: keyValueArrToObj(data.extra_specs),
    }
    const oldKeys = currentItems.find((x) => x.id === id).extra_specs.map((x) => x.key)
    const newKeys = data.extra_specs.map((x) => x.key)
    const keysToDelete = oldKeys.filter((x) => !newKeys.includes(x))
    trackEvent('Update Volume Type', { id })
    return cinder.updateVolumeType(id, converted, keysToDelete)
  },
  deleteVolumeType: async ({ id }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete volume type', { id })
    await cinder.deleteVolumeType(id)
    trackEvent('Delete Volume Type', { id })
  },
})

export const volumeSnapshotActions = createCRUDActions(volumeSnapshotsCacheKey, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get volume snapshots')
    const volumeSnapshots = await cinder.getSnapshots()

    // Change metadata into array form
    return (volumeSnapshots || []).map((volumeSnapshot) => ({
      ...volumeSnapshot,
      metadata: objToKeyValueArr(volumeSnapshot.metadata),
    }))
  },
  updateFn: async (data) => {
    const { id } = data
    Bugsnag.leaveBreadcrumb('Attempting to update volume snapshot', { id })
    const updated = await cinder.updateSnapshot(id, data)
    await cinder.updateSnapshotMetadata(id, keyValueArrToObj(data.metadata))
    trackEvent('Update Volume Snapshot', { id })
    return {
      ...updated,
      metadata: data.metadata,
    }
  },
  createFn: async ({ volumeId, name, description }) => {
    Bugsnag.leaveBreadcrumb('Attempting to create volume snapshot', { volumeId, name, description })
    if (!volumeId) {
      throw new Error('Invalid volumeId')
    }
    trackEvent('Create Volume Snapshot', { volumeId, name, description })
    return cinder.snapshotVolume({
      volume_id: volumeId,
      name,
      description,
    })
  },
  deleteFn: async ({ id }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete volume snapshot', { id })
    await cinder.deleteSnapshot(id)
    trackEvent('Delete Volume Snapshot', { id })
  },
})
