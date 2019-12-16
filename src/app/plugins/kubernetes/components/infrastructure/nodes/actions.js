import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import { serviceCatalogContextKey } from 'openstack/components/api-access/actions'
import { pathStrOrNull, pipeWhenTruthy } from 'utils/fp'
import { find, propEq, prop } from 'ramda'
import { combinedHostsCacheKey } from 'k8s/components/infrastructure/common/actions'
import createContextUpdater from 'core/helpers/createContextUpdater'

const { resmgr, qbert } = ApiClient.getInstance()

export const nodesCacheKey = 'nodes'
export const rawNodesCacheKey = 'rawNodes'

createContextLoader(rawNodesCacheKey, async () => {
  return qbert.getNodes()
}, {
  entityName: 'Node',
  uniqueIdentifier: 'uuid',
})

export const loadNodes = createContextLoader(nodesCacheKey, async (params, loadFromContext) => {
  const [rawNodes, combinedHosts, serviceCatalog] = await Promise.all([
    loadFromContext(rawNodesCacheKey),
    loadFromContext(combinedHostsCacheKey),
    loadFromContext(serviceCatalogContextKey),
  ])

  const combinedHostsObj = combinedHosts.reduce(
    (accum, host) => {
      const id = pathStrOrNull('resmgr.id')(host) || pathStrOrNull('qbert.uuid')(host)
      accum[id] = host
      return accum
    },
    {},
  )

  const qbertUrl = pipeWhenTruthy(
    find(propEq('name', 'qbert')),
    prop('url'),
  )(serviceCatalog) || ''

  // associate nodes with the combinedHost entry
  return rawNodes.map(node => ({
    ...node,
    combined: combinedHostsObj[node.uuid],
    // qbert v3 link fails authorization so we have to use v1 link for logs
    logs: `${qbertUrl}/logs/${node.uuid}`.replace(/v3/, 'v1'),
  }))
}, {
  refetchCascade: true,
  uniqueIdentifier: 'uuid',
})

export const deAuthNode = createContextUpdater('nodes', async (node, prevItems) => {
  await resmgr.unauthorizeHost(node.uuid)
  // Something in `createContextUpdater` is refreshing the API calls for nodes automagically.
  // This what I would be doing manually so it works out fine but I'm a bit concerned
  // that it is not being invoked explicitly from within this action.
  return prevItems
}, {
  successMessage: (updatedItems, prevItems, node) => {
    return `Successfully de-authorized node ${node.name} (${node.primaryIp})`
  },
})
