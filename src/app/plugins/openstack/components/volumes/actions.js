import { objToKeyValueArr, keyValueArrToObj } from 'core/fp'

export const loadVolumes = async ({ setContext, context }) => {
  const volumes = await context.openstackClient.cinder.getVolumes()
  setContext({ volumes })
}

export const updateVolume = async ({ setContext }) => {
  // TODO
}

export const loadVolumeTypes = async ({ setContext, context }) => {
  const volumeTypes = await context.openstackClient.cinder.getVolumeTypes()

  // Change metadata into array form
  const converted = (volumeTypes || []).map(x => ({...x, extra_specs: objToKeyValueArr(x.extra_specs)}))
  setContext({ volumeTypes: converted })

  return converted
}

export const loadVolumeSnapshots = async ({ setContext, context, reload }) => {
  if (!reload && context.volumeSnapshots) { return context.volumeSnapshots }

  const volumeSnapshots = await context.openstackClient.cinder.getSnapshots()

  // Change metadata into array form
  const converted = (volumeSnapshots || []).map(x => ({...x, metadata: objToKeyValueArr(x.metadata)}))
  setContext({ volumeSnapshots: converted })
  return converted
}

export const updateVolumeSnapshot = async (data, { context, setContext }) => {
  const { id } = data
  const { cinder } = context.openstackClient
  const updated = await cinder.updateSnapshot(id, data)
  cinder.updateSnapshotMetadata(id, keyValueArrToObj(data.metadata))
  updated.metadata = data.metadata

  setContext({
    volumeSnapshots: context.volumeSnapshots.map(x => x.id === id ? updated : x)
  })
  return data
}

export const updateVolumeType = async (data, { context, setContext }) => {
  const { id } = data
  const { cinder } = context.openstackClient
  const converted = {
    name: data.name,
    extra_specs: keyValueArrToObj(data.extra_specs),
  }
  const oldKeys = context.volumeTypes.find(x => x.id === id).extra_specs.map(x => x.key)
  const newKeys = data.extra_specs.map(x => x.key)
  const keysToDelete = oldKeys.filter(x => !newKeys.includes(x))
  const updated = await cinder.updateVolumeType(id, converted, keysToDelete)
  const volumeTypes = context.volumeTypes.map(x => x.id === id ? updated : x)
  setContext({ volumeTypes })
  return data
}
