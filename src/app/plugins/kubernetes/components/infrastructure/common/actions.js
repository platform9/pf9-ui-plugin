import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { resMgrHostsSelector } from './selectors'

const { resMgr } = ApiClient.getInstance()

export const loadResMgrHosts = createContextLoader(
  ActionDataKeys.ResMgrHosts,
  async () => {
    return resMgr.getHosts()
  },
  {
    uniqueIdentifier: 'id',
    selector: resMgrHostsSelector,
  },
)

export const flavorActions = createCRUDActions(ActionDataKeys.Flavors, { service: 'nova' })

export const regionActions = createCRUDActions(ActionDataKeys.Regions, { service: 'keystone' })

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
    return loadResMgrHosts()
  },
  {
    operation: 'updateRemoteSupport',
  },
)
