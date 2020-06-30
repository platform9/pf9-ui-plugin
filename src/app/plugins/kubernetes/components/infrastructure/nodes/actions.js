import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { nodesSelector, makeParamsNodesSelector } from './selectors'

const { qbert, resmgr } = ApiClient.getInstance()

export const loadNodes = createContextLoader(
  DataKeys.Nodes,
  async () => {
    const [rawNodes] = await Promise.all([
      qbert.getNodes(),
      // Fetch dependent caches
      loadServiceCatalog(true),
      loadResMgrHosts(true),
    ])
    return rawNodes
  },
  {
    uniqueIdentifier: 'uuid',
    selector: nodesSelector,
    selectorCreator: makeParamsNodesSelector,
  },
)

export const deAuthNode = createContextUpdater(
  DataKeys.Nodes,
  async (node) => {
    await resmgr.unauthorizeHost(node.uuid)
    await loadNodes()
    // TODO: Show success message
  },
  {
    operation: 'deAuthNode',
  },
)
