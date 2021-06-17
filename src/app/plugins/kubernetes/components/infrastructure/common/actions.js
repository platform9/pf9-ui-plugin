import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { trackEvent } from 'utils/tracking'
import { resMgrHostsSelector } from './selectors'

const { resMgr } = ApiClient.getInstance()

export const loadResMgrHosts = createContextLoader(
  ActionDataKeys.ResMgrHosts,
  async () => {
    Bugsnag.leaveBreadcrumb('Attempting to load ResMgr hosts')
    return resMgr.getHosts()
  },
  {
    uniqueIdentifier: 'id',
    selector: resMgrHostsSelector,
  },
)

export const flavorActions = createCRUDActions(ActionDataKeys.Flavors, { service: 'nova' })

export const regionActions = createCRUDActions(ActionDataKeys.Regions, {
  service: 'keystone',
  cache: false,
})

export const updateRemoteSupport = createContextUpdater(
  ActionDataKeys.ResMgrHosts,
  async (data) => {
    const { id, enableSupport } = data
    const supportRoleName = 'pf9-support'
    Bugsnag.leaveBreadcrumb('Attempting to update remote support', { id, enableSupport })
    // If the role push/delete fails, how do I handle that?
    if (enableSupport) {
      await resMgr.addRole(id, supportRoleName)
    } else {
      await resMgr.removeRole(id, supportRoleName)
    }
    trackEvent('Remote Support Update', { id, enableSupport })
    // Reload the resMgrHosts
    return loadResMgrHosts()
  },
  {
    operation: 'updateRemoteSupport',
  },
)
