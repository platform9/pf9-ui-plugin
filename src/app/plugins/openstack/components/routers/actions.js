export const loadRouters = async ({ context, setContext, reload }) => {
  if (!reload && context.routers) { return context.routers }
  const routers = await context.apiClient.neutron.getRouters()
  setContext({ routers })
  return routers
}

export const createRouter = async ({ data, context, setContext }) => {
  const created = await context.apiClient.neutron.createRouter(data)
  const existing = await context.apiClient.neutron.getRouters()
  setContext({ routers: [ ...existing, created ] })
  return created
}

export const deleteRouter = async ({ id, context, setContext }) => {
  await context.apiClient.neutron.deleteRouter(id)
  const newList = context.routers.filter(x => x.id !== id)
  setContext({ routers: newList })
}

export const updateRouter = async ({ data, context, setContext }) => {
  const { id } = data
  const existing = await context.apiClient.neutron.getRouters()
  const updated = await context.apiClient.neutron.updateRouter(id, data)
  const newList = existing.map(x => x.id === id ? x : updated)
  setContext({ routers: newList })
}
