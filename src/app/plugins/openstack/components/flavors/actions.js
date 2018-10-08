export const loadFlavors = async ({ setContext, context, reload }) => {
  if (!reload && context.flavors) { return context.flavors }
  const flavors = await context.apiClient.nova.getFlavors()
  await setContext({ flavors })
  return flavors
}
