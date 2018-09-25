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
  setContext({ volumeSnapshots })
  return volumeSnapshots
}

export const updateVolumeSnapshot = async (data, { context, setContext }) => {
  const { id } = data
  const updated = await context.openstackClient.cinder.updateSnapshot(id, data)
  setContext({
    volumeSnapshots: context.volumeSnapshots.map(x => x.id === id ? updated : x)
  })
  return data
}
