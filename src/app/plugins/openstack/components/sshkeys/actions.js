import uuid from 'uuid'
import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

const dataKey = 'sshKeys'

const injectIds = x => ({ ...x, id: x.id || uuid.v4() })

export const loadSshKeys = contextLoader(dataKey, async ({ apiClient }) => {
  return (await apiClient.nova.getSshKeys()).map(injectIds)
})

export const createSshKey = contextUpdater(dataKey, async ({ apiClient, data, context, setContext }) => {
  const existing = await loadSshKeys({ context, setContext })
  const created = await apiClient.nova.createSshKey(data)
  return [ ...existing, created ]
}, true)

export const deleteSshKey = contextUpdater(dataKey, async ({ apiClient, id, loadFromContext }) => {
  await apiClient.nova.deleteSshKey(id)
  const keys = await loadFromContext(dataKey)
  return keys.filter(x => x.id !== id)
})
