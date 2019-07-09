import contextLoader from 'core/helpers/contextLoader'
import { asyncFlatMap } from 'utils/fp'
import { assoc, propEq } from 'ramda'

export const loadStorageClasses = contextLoader('storageClasses', async ({ apiClient, loadFromContext }) => {
  const clusters = await loadFromContext('clusters')
  const isHealthy = cluster => cluster.healthyMasterNodes.length > 0
  const usableClusters = clusters.filter(isHealthy)
  const getStorageClasses = cluster => apiClient.qbert.getClusterStorageClasses(cluster.uuid)
  const storageClasses = await asyncFlatMap(usableClusters, getStorageClasses, true)

  // Add the clusterName
  const getClusterName = uuid => clusters.find(propEq('uuid', uuid)).name
  const addClusterName = sc => assoc('clusterName', getClusterName(sc.clusterId), sc)
  const annotated = storageClasses.map(addClusterName)
  return annotated
})
