import { combineHost } from './combineHosts'
import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { rawNodesCacheKey } from 'k8s/components/infrastructure/nodes/actions'

export const clustersCacheKey = 'clusters'
export const resMgrHostsCacheKey = 'resMgrHosts'
export const combinedHostsCacheKey = 'combinedHosts'

const { resmgr } = ApiClient.getInstance()

createContextLoader(resMgrHostsCacheKey, async () => {
  return resmgr.getHosts()
}, {
  uniqueIdentifier: 'id',
})

export const flavorActions = createCRUDActions('flavors', { service: 'nova' })

export const regionActions = createCRUDActions('regions', { service: 'keystone' })

export const loadCombinedHosts = createContextLoader(combinedHostsCacheKey, async (params,
  loadFromContext) => {
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
