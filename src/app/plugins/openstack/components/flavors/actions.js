export const loadFlavors = async ({ setContext, context, reload }) => {
  if (!reload && context.flavors) { return context.flavors }
  const flavors = await context.apiClient.nova.getFlavors()
  await setContext({ flavors })
  return flavors
}

export const createFlavor = async ({ data, context, setContext }) => {
  const created = await context.apiClient.nova.createFlavor(data)
  const existing = await context.apiClient.nova.getFlavors()
  setContext({ flavors: [ ...existing, created ] })
  return created
}

export const deleteFlavor = async ({ id, context, setContext }) => {
  await context.apiClient.nova.deleteFlavor(id)
  const newList = context.flavors.filter(x => x.id !== id)
  setContext({ flavors: newList })
}
