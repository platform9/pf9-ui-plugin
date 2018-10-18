const dataKey = 'tenants'

export const loadTenants = async ({ context, setContext, reload }) => {
  if (!reload && context[dataKey]) { return context[dataKey] }
  const existing = await context.apiClient.keystone.getProjects()
  setContext({ [dataKey]: existing })
  return existing
}

export const createTenant = async ({ data, context, setContext }) => {
  const created = await context.apiClient.keystone.createTenant(data)
  const existing = await loadTenants({ context, setContext })
  setContext({ [dataKey]: [ ...existing, created ] })
  return created
}

export const deleteTenant = async ({ id, context, setContext }) => {
  await context.apiClient.keystone.deleteTenant(id)
  const newList = context[dataKey].filter(x => x.id !== id)
  setContext({ [dataKey]: newList })
}

export const updateTenant = async ({ data, context, setContext }) => {
  const { id } = data
  const existing = await loadTenants({ context, setContext })
  const updated = await context.apiClient.keystone.updateTenant(id, data)
  const newList = existing.map(x => x.id === id ? x : updated)
  setContext({ [dataKey]: newList })
}
