import { pluck, flatten, pathOr } from 'ramda'
import { allKey } from 'app/constants'
import ApiClient from 'api-client/ApiClient'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import { someAsync } from 'utils/async'
import { trackEvent } from 'utils/tracking'
import { pathStr } from 'utils/fp'

const { qbert } = ApiClient.getInstance()

export const namespacesCacheKey = 'namespaces'

const findClusterName = (clusters, clusterId) => {
  const cluster = clusters.find((x) => x.uuid === clusterId)
  return (cluster && cluster.name) || ''
}
const namespacesMapper = async (items, params, loadFromContext) => {
  const clusters = await loadFromContext(clustersCacheKey)
  return items.map((ns) => ({
    ...ns,
    clusterName: findClusterName(clusters, ns.clusterId),
    status: pathOr('N/A', ['status', 'phase'], ns),
  }))
}

const namespaceActions = createCRUDActions(namespacesCacheKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterNamespaces)).then(flatten)
    }
    return qbert.getClusterNamespaces(clusterId)
  },
  createFn: async ({ clusterId, name }) => {
    const body = { metadata: { name } }
    const created = await qbert.createNamespace(clusterId, body)
    trackEvent('WZ Create New Namespace', {
      id: pathStr('metadata.uid', created),
      clusterId,
      name,
      wizard_step:'Create Namespace',
      wizard_state:'Complete',
      wizard_progress:'1 of 1',
      wizard_name:'Create New Namespace',
    })
    return response
  },
  deleteFn: async ({ id }, currentItems) => {
    const { clusterId, name } = currentItems.find((ns) => ns.id === id)
    const response = await qbert.deleteNamespace(clusterId, name)
    trackEvent('WZ Delete Namespace', {
      id,
      clusterId,
      name,
      wizard_step:'Delete Namespace',
      wizard_state:'Complete',
      wizard_progress:'1 of 1',
      wizard_name:'Deleted Namespace',
    })
    return response
  },
  uniqueIdentifier: 'id',
  indexBy: 'clusterId',
  dataMapper: namespacesMapper,
})

export default namespaceActions
