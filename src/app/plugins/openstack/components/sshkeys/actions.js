import ApiClient from 'api-client/ApiClient'
import uuid from 'uuid'
import createCRUDActions from 'core/helpers/createCRUDActions'

export const sshDataKey = 'sshKeys'

const { nova } = ApiClient.getInstance()

const injectIds = x => ({ ...x, id: x.id || uuid.v4() })

const sshKeyActions = createCRUDActions(sshDataKey, {
  listFn: async () => {
    return (await nova.getSshKeys()).map(injectIds)
  },
  createFn: async data => {
    return nova.createSshKey(data)
  },
  deleteFn: async ({ id }) => {
    await nova.deleteSshKey(id)
  }
})

export default sshKeyActions
