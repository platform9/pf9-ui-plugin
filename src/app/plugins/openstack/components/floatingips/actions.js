export const loadFloatingIps = async ({ context, setContext, reload }) => {
  if (!reload && context.floatingIps) { return context.floatingIps }
  const floatingIps = await context.apiClient.neutron.getFloatingIps()
  setContext({ floatingIps })
  return floatingIps
}

export const createFloatingIp = async ({ data, context, setContext }) => {
  const existing = await context.apiClient.neutron.getFloatingIps()
  const created = await context.apiClient.neutron.createFloatingIp(data)
  setContext({ floatingIps: [ ...existing, created ] })
  return created
}

export const deleteFloatingIp = async ({ id, context, setContext }) => {
  await context.apiClient.neutron.deleteFloatingIp(id)
  const newList = context.floatingIps.filter(x => x.id !== id)
  setContext({ floatingIps: newList })
}

export const updateFloatingIp = async ({ data, context, setContext }) => {
  console.error('TODO: Update Floating IP not yet implemented')
  /*
  const { id } = data
  const existing = await loadFloatingIps({ context, setContext })
  const updated = await context.apiClient.neutron.updateFloatingIp(id, data)
  const newList = existing.map(x => x.id === id ? x : updated)
  setContext({ floatingIps: newList })
  */
}
