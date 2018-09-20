export const loadFlavors = async ({ setContext, context }) => {
  const flavors = await context.openstackClient.nova.getFlavors()
  setContext({ flavors })
}
