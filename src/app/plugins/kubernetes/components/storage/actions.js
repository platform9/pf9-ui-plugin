import ApiClient from 'api-client/ApiClient'
import { asyncFlatMap } from 'utils/fp'
import { assoc, propEq } from 'ramda'
import { clustersDataKey } from 'k8s/components/infrastructure/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'

export const storageClassesDataKey = 'storageClasses'

const storageClassActions = createCRUDActions(storageClassesDataKey, {
  listFn: async (params, loadFromContext) => {
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
  },
  delete: async ({ id }, currentItems) => {
    const { qbert } = ApiClient.getInstance()
    const item = currentItems.find(propEq('id', id))
    if (!item) {
      throw new Error(`Unable to find storage class with id: ${id} in deleteStorageClass`)
    }
    const { clusterId, name } = item
    await qbert.deleteStorageClass(clusterId, name)
  },
  entityName: 'Storage Class',
})

export default storageClassActions
