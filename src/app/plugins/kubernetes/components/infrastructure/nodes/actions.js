import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import { serviceCatalogContextKey } from 'openstack/components/api-access/actions'
import { pathStrOrNull, pipeWhenTruthy } from 'utils/fp'
import { find, propEq, prop } from 'ramda'
import { combinedHostsCacheKey } from 'k8s/components/infrastructure/common/actions'

const { qbert } = ApiClient.getInstance()

export const nodesCacheKey = 'nodes'
export const rawNodesCacheKey = 'rawNodes'

createContextLoader(rawNodesCacheKey, async () => {
  return qbert.getNodes()
}, { uniqueIdentifier: 'uuid' })

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
    logs: `${qbertUrl}/logs/${node.uuid}`,
  }))
}, {
  refetchCascade: true,
  uniqueIdentifier: 'uuid',
})
