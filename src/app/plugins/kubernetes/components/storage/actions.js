import contextLoader from 'core/helpers/contextLoader'
import { loadClusters } from '../infrastructure/actions'
import { asyncFlatMap } from 'utils/fp'
import { assoc, path, propEq } from 'ramda'

export const loadStorageClasses = contextLoader('storageClasses', async (params) => {
  const clusters = await loadClusters(params)
  const qbert = path(['context', 'apiClient', 'qbert'], params)
  const isHealthy = cluster => cluster.healthyMasterNodes.length > 0
  const usableClusters = clusters.filter(isHealthy)
  const getStorageClasses = cluster => qbert.getClusterStorageClasses(cluster.uuid)
  const storageClasses = await asyncFlatMap(usableClusters, getStorageClasses, true)

  // Add the clusterName
  const getClusterName = uuid => clusters.find(propEq('uuid', uuid)).name
  const addClusterName = sc => assoc('clusterName', getClusterName(sc.clusterId), sc)
  const annotated = storageClasses.map(addClusterName)
  return annotated
})
