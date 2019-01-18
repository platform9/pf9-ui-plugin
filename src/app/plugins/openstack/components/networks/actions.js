export const loadNetworks = async ({ context, setContext, reload }) => {
  if (!reload && context.networks) { return context.networks }
  const networks = await context.apiClient.neutron.getNetworks()
  setContext({ networks })
  return networks
}

export const createNetwork = async ({ data, context, setContext }) => {
  const existing = await context.apiClient.neutron.getNetworks()
  const created = await context.apiClient.neutron.createNetwork(data)
  setContext({ networks: [ ...existing, created ] })
  return created
}

export const deleteNetwork = async ({ id, context, setContext }) => {
  await context.apiClient.neutron.deleteNetwork(id)
  const newList = context.networks.filter(x => x.id !== id)
  setContext({ networks: newList })
}

export const updateNetwork = async ({ data, context, setContext }) => {
  const { id } = data
  const existing = await context.apiClient.neutron.getNetworks()
  const updated = await context.apiClient.neutron.updateNetwork(id, data)
  const newList = existing.map(x => x.id === id ? x : updated)
  setContext({ networks: newList })
}
