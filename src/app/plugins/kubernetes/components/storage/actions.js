import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'
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

export const deleteStorageClass = contextUpdater('storageClasses', async ({ id, apiClient, currentItems, showToast }) => {
  const item = currentItems.find(propEq('id', id))
  if (!item) {
    console.error(`Unable to find storage class with id: ${id} in deleteStorageClass`)
    return
  }
  try {
    const { clusterId, name } = item
    await apiClient.qbert.deleteStorageClass(clusterId, name)
    showToast(`Successfully deleted storage class ${name}`, 'success')
    return currentItems.filter(x => x.id !== id)
  } catch (err) {
    showToast(err, 'error')
    console.log(err)
  }
})
