import { asyncFlatMap } from 'utils/fp'
import { pluck } from 'ramda'
import contextUpdater from 'core/helpers/contextUpdater'
import clusterContextLoader from 'core/helpers/clusterContextLoader'

export const loadNamespaces = clusterContextLoader('namespaces',
  async ({ apiClient: { qbert }, preloaded: { clusters }, params: { clusterUuid } }) => {
    return clusterUuid === '__all__'
      ? asyncFlatMap(pluck('uuid', clusters), qbert.getClusterNamespaces)
      : qbert.getClusterNamespaces(clusterUuid)
  }, {
    clusterIdKey: 'clusterUuid'
  })

export const createNamespace = contextUpdater('namespaces', async ({ apiClient, currentItems, data }) => {
  const { clusterId, name } = data
  const body = { metadata: { name } }
  const created = await apiClient.qbert.createNamespace(clusterId, body)
  return [...currentItems, created]
}, true)

export const deleteNamespace = contextUpdater('namespaces', async ({ apiClient, currentItems, params: { id } }) => {
  const { clusterId, name } = currentItems.find(ns => ns.id === id)
  await apiClient.qbert.deleteNamespace(clusterId, name)
  return currentItems.filter(x => x.id !== id)
})
