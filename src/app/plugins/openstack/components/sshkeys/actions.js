import uuid from 'uuid'
import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

const dataKey = 'sshKeys'

const injectIds = x => ({ ...x, id: x.id || uuid.v4() })

export const loadSshKeys = contextLoader(dataKey, async ({ context }) => {
  return (await context.apiClient.nova.getSshKeys()).map(injectIds)
})

export const createSshKey = contextUpdater(dataKey, async ({ data, context, setContext }) => {
  const existing = await loadSshKeys({ context, setContext })
  const created = await context.apiClient.nova.createSshKey(data)
  return [ ...existing, created ]
}, true)

export const deleteSshKey = contextUpdater(dataKey, async ({ id, context }) => {
  await context.apiClient.nova.deleteSshKey(id)
  return context[dataKey].filter(x => x.id !== id)
})
