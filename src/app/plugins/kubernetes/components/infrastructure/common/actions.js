import { combineHost } from './combineHosts'
import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { rawNodesCacheKey, loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { uniq } from 'ramda'
import { except } from 'utils/fp'

export const clustersCacheKey = 'clusters'
export const resMgrHostsCacheKey = 'resMgrHosts'
export const combinedHostsCacheKey = 'combinedHosts'

const { resmgr } = ApiClient.getInstance()

const loadResMgrHosts = createContextLoader(resMgrHostsCacheKey, async () => {
  return resmgr.getHosts()
}, {
  uniqueIdentifier: 'id',
})

export const flavorActions = createCRUDActions('flavors', { service: 'nova' })

export const regionActions = createCRUDActions('regions', { service: 'keystone' })

export const loadCombinedHosts = createContextLoader(combinedHostsCacheKey, async (params,
  loadFromContext) => {
  // Invalidate dependent caches when reloading so that only new data is used.
  // Not sure if rawNodes is required to invalidate here... if we invalidate it here,
  // then upon refreshing nodes, the nodes API will be called twice since it gets
  // invalidated in the nodes loader as well
  loadResMgrHosts.invalidateCache(false)
  const [rawNodes, resMgrHosts] = await Promise.all([
    loadFromContext(rawNodesCacheKey),
    loadFromContext(resMgrHostsCacheKey),
  ])
  const hostsById = {}
  // We don't want to perform a check to see if the object exists yet for each type of host
  // so make a utility to make it cleaner.
  const setHost = (type, id, value) => {
    hostsById[id] = hostsById[id] || {}
    hostsById[id][type] = value
  }
  rawNodes.forEach(node => setHost('qbert', node.uuid, node))
  resMgrHosts.forEach(resMgrHost => setHost('resmgr', resMgrHost.id, resMgrHost))

  // Convert it back to array form
  return Object.values(hostsById).map(combineHost)
}, {
  uniqueIdentifier: 'id',
})

export const updateRemoteSupport = createContextUpdater(combinedHostsCacheKey, async (data,
  currentItems) => {
  const { id, enableSupport } = data
  const host = currentItems.find(x => x.id === id)
  const supportRoleName = 'pf9-support'
  // Invalidate nodes cache so that it can get a new list after the update
  loadNodes.invalidateCache(false)

  // If the role push/delete fails, how do I handle that?
  // These returned combinedHost objects actually will not be used at all
  // due to invalidating the combinedHosts cache in the nodes loader.
  if (enableSupport) {
    await resmgr.pushRole(id, supportRoleName)
    return {
      roles: uniq([...host.roles, supportRoleName]),
      roleStatus: 'converging',
      uiState: 'pending',
      supportRole: true,
    }
  }

  await resmgr.removeRole(id, supportRoleName)
  return {
    roles: except(supportRoleName, host.roles),
    roleStatus: 'converging',
    uiState: 'pending',
    supportRole: false,
  }
}, { operation: 'update' })
