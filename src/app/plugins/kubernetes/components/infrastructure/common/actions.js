import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { ActionDataKeys } from 'k8s/DataKeys'

const { resMgr } = ApiClient.getInstance()

export const loadResMgrHosts = createContextLoader(
  ActionDataKeys.ResMgrHosts,
  async () => {
    return resMgr.getHosts()
  },
  {
    uniqueIdentifier: 'id',
  },
)

export const flavorActions = createCRUDActions('flavors', { service: 'nova' })

export const regionActions = createCRUDActions('regions', { service: 'keystone' })

export const updateRemoteSupport = createContextUpdater(
  ActionDataKeys.ResMgrHosts,
  async (data) => {
    const { id, enableSupport } = data
    const supportRoleName = 'pf9-support'

    // If the role push/delete fails, how do I handle that?
    if (enableSupport) {
      await resMgr.addRole(id, supportRoleName)
    } else {
      await resMgr.removeRole(id, supportRoleName)
    }
    // Reload the resMgrHosts
    await loadResMgrHosts(true)
  },
  {
    operation: 'updateRemoteSupport',
  },
)
