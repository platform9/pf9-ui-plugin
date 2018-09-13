export const loadVolumes = async ({ setContext, context }) => {
  const volumes = await context.openstackClient.cinder.getVolumes()
  setContext({ volumes })
}

export const updateVolume = async ({ setContext }) => {
}

export const loadVolumeTypes = async ({ setContext, context }) => {
  const volumeTypes = await context.openstackClient.cinder.getVolumeTypes()
  setContext({ volumeTypes })
}
