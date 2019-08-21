import createContextLoader from 'core/helpers/createContextLoader'
import { asyncFlatMap } from 'utils/fp'
import { pluck } from 'ramda'
import { allKey } from 'app/constants'
import createContextUpdater from 'core/helpers/createContextUpdater'
import ApiClient from 'api-client/ApiClient'
import { parseClusterParams, clustersContextKey } from 'k8s/components/infrastructure/actions'

const findClusterName = (clusters, clusterId) => {
  const cluster = clusters.find(x => x.uuid === clusterId)
  return (cluster && cluster.name) || ''
}
const namespacesMapper = async (items, params, loadFromContext) => {
  const clusters = await loadFromContext(clustersContextKey)
  return items.map(ns => ({
    ...ns,
    clusterName: findClusterName(clusters, ns.clusterId),
  }))
}

export const loadNamespaces = createContextLoader('namespaces', async (params, loadFromContext) => {
  const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
  const { qbert } = ApiClient.getInstance()
  return clusterId === allKey
    ? asyncFlatMap(pluck('uuid', clusters), qbert.getClusterNamespaces)
    : qbert.getClusterNamespaces(clusterId)
},
{
  indexBy: 'clusterId',
  dataMapper: namespacesMapper
})

export const createNamespace = createContextUpdater('namespaces', async ({ clusterId, name }) => {
  const { qbert } = ApiClient.getInstance()
  const body = { metadata: { name } }
  return qbert.createNamespace(clusterId, body)
}, { operation: 'create' })

export const deleteNamespace = createContextUpdater('namespaces', async ({ id }, currentItems) => {
  const { qbert } = ApiClient.getInstance()
  const { clusterId, name } = currentItems.find(ns => ns.id === id)
  await qbert.deleteNamespace(clusterId, name)
}, { operation: 'delete' })
