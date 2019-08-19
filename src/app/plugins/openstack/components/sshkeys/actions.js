import ApiClient from 'api-client/ApiClient'
import uuid from 'uuid'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'

const sshContextKey = 'sshKeys'
const injectIds = x => ({ ...x, id: x.id || uuid.v4() })

export const loadSshKeys = createContextLoader(sshContextKey, async () => {
  const { nova } = ApiClient.getInstance()
  return (await nova.getSshKeys()).map(injectIds)
})

export const createSshKey = createContextUpdater(sshContextKey, async data => {
  const { nova } = ApiClient.getInstance()
  return nova.createSshKey(data)
}, { operation: 'create' })

export const deleteSshKey = createContextUpdater(sshContextKey, async ({ id }) => {
  const { nova } = ApiClient.getInstance()
  await nova.deleteSshKey(id)
}, { operation: 'delete' })
