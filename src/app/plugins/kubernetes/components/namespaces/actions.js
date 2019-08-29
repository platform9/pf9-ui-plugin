import { asyncFlatMap } from 'utils/fp'
import { pluck } from 'ramda'
import { allKey } from 'app/constants'
import ApiClient from 'api-client/ApiClient'
import { parseClusterParams, clustersDataKey } from 'k8s/components/infrastructure/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'

const { qbert } = ApiClient.getInstance()

export const namespacesDataKey = 'namespaces'

const findClusterName = (clusters, clusterId) => {
  const cluster = clusters.find(x => x.uuid === clusterId)
  return (cluster && cluster.name) || ''
}
const namespacesMapper = async (items, params, loadFromContext) => {
  const clusters = await loadFromContext(clustersDataKey)
  return items.map(ns => ({
    ...ns,
    clusterName: findClusterName(clusters, ns.clusterId),
  }))
}

const namespaceActions = createCRUDActions(namespacesDataKey, {
  listFn: async (params, loadFromContext) => {
    const [ clusterId, clusters ] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return asyncFlatMap(pluck('uuid', clusters), qbert.getClusterNamespaces)
    }
    return qbert.getClusterNamespaces(clusterId)
  },
  createFn: async ({ clusterId, name }) => {
    const body = { metadata: { name } }
    return qbert.createNamespace(clusterId, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    const { clusterId, name } = currentItems.find(ns => ns.id === id)
    await qbert.deleteNamespace(clusterId, name)
  },
  uniqueIdentifier: 'id',
  indexBy: 'clusterId',
  dataMapper: namespacesMapper
})

export default namespaceActions
