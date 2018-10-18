import uuid from 'uuid'

const dataKey = 'sshKeys'

const injectIds = x => ({ ...x, id: x.id || uuid.v4() })

export const loadSshKeys = async ({ context, setContext, reload }) => {
  if (!reload && context[dataKey]) { return context[dataKey] }
  const existing = (await context.apiClient.nova.getSshKeys()).map(injectIds)
  setContext({ [dataKey]: existing })
  return existing
}

export const createSshKey = async ({ data, context, setContext }) => {
  const created = await context.apiClient.nova.createSshKey(data)
  const existing = await loadSshKeys({ context, setContext })
  setContext({ [dataKey]: [ ...existing, created ] })
  return created
}

export const deleteSshKey = async ({ id, context, setContext }) => {
  await context.apiClient.nova.deleteSshKey(id)
  const newList = context[dataKey].filter(x => x.id !== id)
  setContext({ [dataKey]: newList })
}
