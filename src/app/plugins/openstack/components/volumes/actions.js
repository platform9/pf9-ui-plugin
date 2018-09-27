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
  setContext({ volumeTypes })
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
