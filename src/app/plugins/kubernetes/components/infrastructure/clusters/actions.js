import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { allKey } from 'app/constants'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'
import { updateWith, adjustWith } from 'utils/fp'
import { pathOr, pick, propEq, mergeLeft } from 'ramda'
import {
  createBareOSCluster,
  createAzureCluster,
  createAwsCluster,
  getEtcdBackupPayload,
  getProgressPercent,
  getKubernetesVersion,
} from 'k8s/components/infrastructure/clusters/helpers'
import { mapAsync } from 'utils/async'
import { clusterTagActions } from 'k8s/components/prometheus/actions'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'

const { qbert } = ApiClient.getInstance()

export const clusterActions = createCRUDActions(clustersCacheKey, {
  listFn: async () => {
    const [
      rawClusters,
    ] = await Promise.all([
      qbert.getClusters(),
      qbert.baseUrl(),
      clusterTagActions.list(),
      loadNodes(),
    ])

    return mapAsync(async cluster => {
      const progressPercent =
        cluster.taskStatus === 'converging' ? await getProgressPercent(cluster.uuid) : null
      const version = await getKubernetesVersion(cluster.uuid)
      return {
        ...cluster,
        progressPercent,
        version,
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

    // This is currently supported by all cloud providers except GCP (which we
    // don't have yet anyways)
    body.etcdBackup = getEtcdBackupPayload('etcdBackup', params)

    await qbert.updateCluster(uuid, body)
    // Doing this will help update the table, but the cache remains incorrect...
    // Same issue regarding cache applies to anything else updated this function
    // body.etcdBackupEnabled = !!body.etcdBackup
    clusterActions.invalidateCache()
    return body
  },
  deleteFn: async ({ uuid }) => {
    await qbert.deleteCluster(uuid)
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
      return prevItems
    },
    detachNodes: async ({ cluster, nodes }, prevItems) => {
      await qbert.detach(cluster.uuid, nodes)
      return prevItems
    },
  },
  uniqueIdentifier: 'uuid',
})

// If params.clusterId is not assigned it fetches all clusters
// and extracts the clusterId from the first cluster
// It also adds a "clusters" param that contains all the clusters, just for convenience
export const parseClusterParams = async (params) => {
  const clusters = await clusterActions.list(params)
  const { clusterId = pathOr(allKey, [0, 'uuid'], clusters) } = params
  return [clusterId, clusters]
}
