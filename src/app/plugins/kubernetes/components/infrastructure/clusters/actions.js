import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import {
  createAwsCluster,
  createAzureCluster,
  createBareOSCluster,
  getEtcdBackupPayload,
  getKubernetesVersion,
  getProgressPercent,
} from 'k8s/components/infrastructure/clusters/helpers'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { mergeLeft, pathOr, pick, propEq } from 'ramda'
import { mapAsync } from 'utils/async'
import { adjustWith, updateWith } from 'utils/fp'
import { clustersSelector, makeParamsClustersSelector } from './selectors'

const { appbert, qbert } = ApiClient.getInstance()

export const clusterTagActions = createCRUDActions(ActionDataKeys.ClusterTags, {
  listFn: async () => {
    return appbert.getClusterTags()
  },
  uniqueIdentifier: 'uuid',
})

export const clusterActions = createCRUDActions(ActionDataKeys.Clusters, {
  listFn: async () => {
    const [rawClusters] = await Promise.all([
      qbert.getClusters(),
      // Fetch dependent caches
      clusterTagActions.list(),
      loadNodes(),
    ])

    return mapAsync(async (cluster) => {
      const progressPercent =
        cluster.taskStatus === 'converging' ? await getProgressPercent(cluster.uuid) : null
      const version = await getKubernetesVersion(cluster.uuid)
      const baseUrl = await qbert.clusterBaseUrl(cluster.uuid)

      return {
        ...cluster,
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
