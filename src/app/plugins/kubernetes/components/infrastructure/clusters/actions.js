import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import {
  createAwsCluster,
  createAzureCluster,
  createBareOSCluster,
  getKubernetesVersion,
  getProgressPercent,
} from 'k8s/components/infrastructure/clusters/helpers'
import {
  clustersSelector,
  makeParamsClustersSelector,
} from 'k8s/components/infrastructure/clusters/selectors'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { mergeLeft, pathOr, pick, propEq } from 'ramda'
import { mapAsync } from 'utils/async'
import { adjustWith, updateWith } from 'utils/fp'
import { trackEvent } from 'utils/tracking'

const { appbert, qbert } = ApiClient.getInstance()

export const clusterTagActions = createCRUDActions(ActionDataKeys.ClusterTags, {
  listFn: async () => {
    return appbert.getClusterTags()
  },
  uniqueIdentifier: 'uuid',
})

const getCsiDrivers = async (clusterUiid) => {
  try {
    return await qbert.getClusterCsiDrivers(clusterUiid)
  } catch (e) {
    console.warn(e)
    return null
  }
}

export const clusterActions = createCRUDActions(ActionDataKeys.Clusters, {
  listFn: async () => {
    const [rawClusters] = await Promise.all([
      qbert.getClusters(),
      // Fetch dependent caches
      clusterTagActions.list(),
      loadNodes(),
      loadResMgrHosts(),
    ])

    return mapAsync(async (cluster) => {
      const progressPercent =
        cluster.taskStatus === 'converging' ? await getProgressPercent(cluster.uuid) : null
      const version = await getKubernetesVersion(cluster.uuid)
      const baseUrl = await qbert.clusterBaseUrl(cluster.uuid)
      const csiDrivers = await getCsiDrivers(cluster.uuid)

      return {
        ...cluster,
        csiDrivers,
        progressPercent,
        version,
        baseUrl,
      }
    }, rawClusters)
  },
  createFn: (params) => {
    if (params.clusterType === 'aws') {
      return createAwsCluster(params)
    }
    if (params.clusterType === 'azure') {
      return createAzureCluster(params)
    }
    if (params.clusterType === 'local') {
      return createBareOSCluster(params)
    }
  },
  updateFn: async ({ uuid, ...params }) => {
    const updateableParams = 'name tags numWorkers numMinWorkers numMaxWorkers'.split(' ')

    const body = pick(updateableParams, params)
    body.etcdBackup = {
      isEtcdBackupEnabled: params.etcdBackup ? 1 : 0,
      storageType: 'local',
      storageProperties: {
        localPath: params.etcdStoragePath,
      },
      intervalInMins: params.etcdBackupInterval,
    }

    await qbert.updateCluster(uuid, body)
    trackEvent('Update Cluster', { uuid })

    // Doing this will help update the table, but the cache remains incorrect...
    // Same issue regarding cache applies to anything else updated this function
    // body.etcdBackupEnabled = !!body.etcdBackup
    clusterActions.invalidateCache()
    return body
  },
  deleteFn: async ({ uuid }) => {
    await qbert.deleteCluster(uuid)
    // Delete cluster Segment tracking is done in ClusterDeleteDialog.tsx because that code
    // has more context about the cluster name, etc.

    // Refresh clusters since combinedHosts will still
    // have references to the deleted cluster.
    // loadCombinedHosts.invalidateCache()
  },
  customOperations: {
    scaleCluster: async ({ cluster, numSpotWorkers, numWorkers, spotPrice }, prevItems) => {
      const body = {
        numWorkers,
        numSpotWorkers: numSpotWorkers || 0,
        spotPrice: spotPrice || 0.001,
        spotWorkerFlavor: cluster.cloudProperties.workerFlavor,
      }
      await qbert.updateCluster(cluster.uuid, body)
      trackEvent('Scale Cluster', { clusterUuid: cluster.uuid, numSpotWorkers, numWorkers })

      // Update the cluster in the cache
      return updateWith(
        propEq('uuid', cluster.uuid),
        {
          ...cluster,
          numWorkers,
        },
        prevItems,
      )
    },
    upgradeCluster: async ({ uuid }, prevItems) => {
      await qbert.upgradeCluster(uuid)
      trackEvent('Upgrade Cluster', { clusterUuid: uuid })

      // Update the cluster in the cache
      return adjustWith(
        propEq('uuid', uuid),
        mergeLeft({
          canUpgrade: false,
        }),
        prevItems,
      )
    },
    updateTag: async ({ cluster, key, val }, prevItems) => {
      const body = {
        tags: { ...(cluster.tags || {}), [key]: val },
      }

      await qbert.updateCluster(cluster.uuid, body)

      return updateWith(
        propEq('uuid', cluster.uuid),
        {
          ...cluster,
          ...body,
        },
        prevItems,
      )
    },
    attachNodes: async ({ cluster, nodes }, prevItems) => {
      await qbert.attach(cluster.uuid, nodes)
      trackEvent('Cluster Attach Nodes', {
        numNodes: (nodes || []).length,
        clusterUuid: cluster.uuid,
      })
      // loadCombinedHosts.invalidateCache()
      return prevItems
    },
    detachNodes: async ({ cluster, nodes }, prevItems) => {
      await qbert.detach(cluster.uuid, nodes)
      trackEvent('Cluster Detach Nodes', {
        numNodes: (nodes || []).length,
        clusterUuid: cluster.uuid,
      })
      // loadCombinedHosts.invalidateCache()
      return prevItems
    },
  },
  uniqueIdentifier: 'uuid',
  selector: clustersSelector,
  selectorCreator: makeParamsClustersSelector,
})

// If params.clusterId is not assigned it fetches all clusters
// and extracts the clusterId from the first cluster
// It also adds a "clusters" param that contains all the clusters, just for convenience
export const parseClusterParams = async (params) => {
  const clusters = await clusterActions.list(params)
  const { clusterId = pathOr(allKey, [0, 'uuid'], clusters) } = params
  return [clusterId, clusters]
}
