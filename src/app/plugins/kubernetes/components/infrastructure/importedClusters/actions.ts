import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { importedClustersSelector } from './selectors'

const { qbert } = ApiClient.getInstance()

export const getImportedClusters = async () => {
  const response = await qbert.getImportedClusters()
  console.log(response)
  return response
}

export const importedClusterActions = createCRUDActions(ActionDataKeys.ImportedClusters, {
  listFn: async () => {
    const importedClusters = await qbert.getImportedClusters()
    return importedClusters
  },
  uniqueIdentifier: 'uuid',
  selector: importedClustersSelector,
})

// export const clusterActions = createCRUDActions(ActionDataKeys.ImportedClusters, {
//   listFn: async () => {
//     const importedClusters = await qbert.getImportedClusters()
//     const [rawClusters] = await Promise.all([
//       qbert.getClusters(),
//       // Fetch dependent caches
//       clusterTagActions.list(),
//       loadNodes(),
//       loadResMgrHosts(),
//     ])

//     return mapAsync(async (cluster) => {
//       const progressPercent =
//         cluster.taskStatus === 'converging' ? await getProgressPercent(cluster.uuid) : null
//       const version = await getKubernetesVersion(cluster.uuid)
//       const baseUrl = await qbert.clusterBaseUrl(cluster.uuid)
//       const csiDrivers = await getCsiDrivers(cluster.uuid)

//       return {
//         ...cluster,
//         csiDrivers,
//         progressPercent,
//         version,
//         baseUrl,
//       }
//     }, rawClusters)
//   },
//   createFn: (params) => {
//     if (params.clusterType === 'aws') {
//       return createAwsCluster(params)
//     }
//     if (params.clusterType === 'azure') {
//       return createAzureCluster(params)
//     }
//     if (params.clusterType === 'local') {
//       return createBareOSCluster(params)
//     }
//   },
//   updateFn: async ({ uuid, ...params }) => {
//     const updateableParams = 'name tags numWorkers numMinWorkers numMaxWorkers'.split(' ')

//     const body = pick(updateableParams, params)
//     if (params.etcdBackup) {
//       body.etcdBackup = getEtcdBackupPayload('etcdBackup', params)
//     }

//     await qbert.updateCluster(uuid, body)
//     trackEvent('Update Cluster', { uuid })

//     // Doing this will help update the table, but the cache remains incorrect...
//     // Same issue regarding cache applies to anything else updated this function
//     // body.etcdBackupEnabled = !!body.etcdBackup
//     clusterActions.invalidateCache()
//     return body
//   },
//   deleteFn: async ({ uuid }) => {
//     await qbert.deleteCluster(uuid)
//     // Delete cluster Segment tracking is done in ClusterDeleteDialog.tsx because that code
//     // has more context about the cluster name, etc.

//     // Refresh clusters since combinedHosts will still
//     // have references to the deleted cluster.
//     // loadCombinedHosts.invalidateCache()
//   },
//   customOperations: {
//     scaleCluster: async ({ cluster, numSpotWorkers, numWorkers, spotPrice }, prevItems) => {
//       const body = {
//         numWorkers,
//         numSpotWorkers: numSpotWorkers || 0,
//         spotPrice: spotPrice || 0.001,
//         spotWorkerFlavor: cluster.cloudProperties.workerFlavor,
//       }
//       await qbert.updateCluster(cluster.uuid, body)
//       trackEvent('Scale Cluster', { clusterUuid: cluster.uuid, numSpotWorkers, numWorkers })

//       // Update the cluster in the cache
//       return updateWith(
//         propEq('uuid', cluster.uuid),
//         {
//           ...cluster,
//           numWorkers,
//         },
//         prevItems,
//       )
//     },
//     upgradeCluster: async ({ cluster, upgradeType }, prevItems) => {
//       await qbert.upgradeCluster(cluster.uuid, upgradeType)
//       trackEvent('Upgrade Cluster', { clusterUuid: cluster.uuid })

//       // Multiple fields change on cluster upgrade, best to reload the entity to get updated values
//       // Ideally the upgrade cluster call would return the updated entity
//       const updatedCluster = await qbert.getClusterDetails(cluster.uuid)
//       return adjustWith(propEq('uuid', cluster.uuid), mergeLeft(updatedCluster), prevItems)
//     },
//     updateTag: async ({ cluster, key, val }, prevItems) => {
//       const body = {
//         tags: { ...(cluster.tags || {}), [key]: val },
//       }

//       await qbert.updateCluster(cluster.uuid, body)

//       return updateWith(
//         propEq('uuid', cluster.uuid),
//         {
//           ...cluster,
//           ...body,
//         },
//         prevItems,
//       )
//     },
//     attachNodes: async ({ cluster, nodes }, prevItems) => {
//       await qbert.attach(cluster.uuid, nodes)
//       trackEvent('Cluster Attach Nodes', {
//         numNodes: (nodes || []).length,
//         clusterUuid: cluster.uuid,
//       })
//       // loadCombinedHosts.invalidateCache()
//       return prevItems
//     },
//     detachNodes: async ({ cluster, nodes }, prevItems) => {
//       await qbert.detach(cluster.uuid, nodes)
//       trackEvent('Cluster Detach Nodes', {
//         numNodes: (nodes || []).length,
//         clusterUuid: cluster.uuid,
//       })
//       // loadCombinedHosts.invalidateCache()
//       return prevItems
//     },
//   },
//   uniqueIdentifier: 'uuid',
//   selector: clustersSelector,
//   selectorCreator: makeParamsClustersSelector,
// })
