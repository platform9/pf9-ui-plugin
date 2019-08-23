import createContextLoader from 'core/helpers/createContextLoader'
import { asyncFlatMap } from 'utils/fp'
import { pluck } from 'ramda'
import { allKey } from 'app/constants'
import createContextUpdater from 'core/helpers/createContextUpdater'
import ApiClient from 'api-client/ApiClient'
import { parseClusterParams, clustersDataKey } from 'k8s/components/infrastructure/actions'

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

createContextLoader(namespacesDataKey, async (params, loadFromContext) => {
  const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
  return clusterId === allKey
    ? asyncFlatMap(pluck('uuid', clusters), qbert.getClusterNamespaces)
    : qbert.getClusterNamespaces(clusterId)
}, {
  uniqueIdentifier: 'id',
  indexBy: 'clusterId',
  dataMapper: namespacesMapper
})

createContextUpdater(namespacesDataKey, async ({ clusterId, name }) => {
  const body = { metadata: { name } }
  return qbert.createNamespace(clusterId, body)
}, { operation: 'create' })

createContextUpdater(namespacesDataKey, async ({ id }, currentItems) => {
  const { clusterId, name } = currentItems.find(ns => ns.id === id)
  await qbert.deleteNamespace(clusterId, name)
}, { operation: 'delete' })
