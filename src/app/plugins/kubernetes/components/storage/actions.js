import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { asyncFlatMap } from 'utils/fp'
import { assoc, propEq } from 'ramda'
import { clustersDataKey } from 'k8s/components/infrastructure/actions'

export const storageClassesDataKey = 'storageClasses'

export const loadStorageClasses = createContextLoader(storageClassesDataKey, async (params, loadFromContext) => {
  const { qbert } = ApiClient.getInstance()
  const clusters = await loadFromContext(clustersDataKey)
  const isHealthy = cluster => cluster.healthyMasterNodes.length > 0
  const usableClusters = clusters.filter(isHealthy)
  const getStorageClasses = cluster => qbert.getClusterStorageClasses(cluster.uuid)
  const storageClasses = await asyncFlatMap(usableClusters, getStorageClasses, true)

  // Add the clusterName
  const getClusterName = uuid => clusters.find(propEq('uuid', uuid)).name
  const addClusterName = sc => assoc('clusterName', getClusterName(sc.clusterId), sc)
  return storageClasses.map(addClusterName)
})

export const deleteStorageClass = createContextUpdater(storageClassesDataKey, async ({ id }, currentItems) => {
  const { qbert } = ApiClient.getInstance()
  const item = currentItems.find(propEq('id', id))
  if (!item) {
    throw new Error(`Unable to find storage class with id: ${id} in deleteStorageClass`)
  }
  const { clusterId, name } = item
  await qbert.deleteStorageClass(clusterId, name)
}, {
  operation: 'delete',
})
