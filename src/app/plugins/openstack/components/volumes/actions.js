export const loadVolumes = async ({ setContext, context }) => {
  const volumes = await context.openstackClient.cinder.getVolumes()
  setContext({ volumes })
}

export const updateVolume = async ({ setContext }) => {
}
