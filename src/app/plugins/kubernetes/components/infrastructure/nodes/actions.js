import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { trackEvent } from 'utils/tracking'
import { nodesSelector, makeParamsNodesSelector } from './selectors'
import { ActionDataKeys } from 'k8s/DataKeys'

const { qbert, resMgr } = ApiClient.getInstance()

export const loadNodes = createContextLoader(
  ActionDataKeys.Nodes,
  async () => {
    const [rawNodes] = await Promise.all([
      qbert.getNodes(),
      // Fetch dependent caches
      loadServiceCatalog(),
      loadResMgrHosts(),
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
  ActionDataKeys.Nodes,
  async (node) => {
    await resMgr.unauthorizeHost(node.uuid)
    trackEvent('Deauthorize Node', {
      node_name: node.name,
    })
    return loadNodes()
    // TODO: Show success message
  },
  {
    operation: 'deAuthNode',
  },
)
