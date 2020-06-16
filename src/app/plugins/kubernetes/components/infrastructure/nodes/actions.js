import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import createContextUpdater from 'core/helpers/createContextUpdater'

const { qbert, resmgr } = ApiClient.getInstance()

export const nodesCacheKey = 'nodes'

export const loadNodes = createContextLoader(
  nodesCacheKey,
  async () => {
    const [rawNodes] = await Promise.all([
      qbert.getNodes(),
      // Refetch dependent caches
      loadServiceCatalog(true),
      loadResMgrHosts(true)
    ])
    return rawNodes
  },
  {
    uniqueIdentifier: 'uuid',
  },
)

export const deAuthNode = createContextUpdater(nodesCacheKey, async (node) => {
  await resmgr.unauthorizeHost(node.uuid)
  await loadNodes()
  // TODO: Show success message
}, {
  operation: 'deAuthNode'
})
