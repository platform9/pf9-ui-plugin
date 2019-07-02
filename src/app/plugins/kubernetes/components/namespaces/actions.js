import clusterContextLoader from 'core/helpers/clusterContextLoader'
import { asyncFlatMap } from 'utils/fp'
import { pluck } from 'ramda'
import clusterContextUpdater from 'core/helpers/clusterContextUpdater'

export const loadNamespaces = clusterContextLoader('namespaces', async ({ apiClient, loadFromContext, params: { clusterId } }) => {
  const { qbert } = apiClient
  const clusters = await loadFromContext('clusters')
  return !clusterId || clusterId === '__all__'
    ? asyncFlatMap(pluck('uuid', clusters), qbert.getClusterNamespaces)
    : qbert.getClusterNamespaces(clusterId)
})

export const createNamespace = clusterContextUpdater('namespaces', async ({ apiClient, currentItems, data }) => {
  const { clusterId, name } = data
  const body = { metadata: { name } }
  const created = await apiClient.qbert.createNamespace(clusterId, body)
  return [...currentItems, created]
}, true)

export const deleteNamespace = clusterContextUpdater('namespaces', async ({ apiClient, currentItems, params: { id } }) => {
  const { clusterId, name } = currentItems.find(ns => ns.id === id)
  await apiClient.qbert.deleteNamespace(clusterId, name)
  return currentItems.filter(x => x.id !== id)
})
