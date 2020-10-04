import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import ActionsSet from 'core/actions/ActionsSet'
import createCRUDActions from 'core/helpers/createCRUDActions'
import {
  createAwsCluster,
  createAzureCluster,
  createBareOSCluster,
  getEtcdBackupPayload,
  getKubernetesVersion,
  getProgressPercent,
} from 'k8s/components/infrastructure/clusters/helpers'
import DataKeys, { ActionDataKeys } from 'k8s/DataKeys'
import { pathOr, pick } from 'ramda'
import { mapAsync } from 'utils/async'
import { ClusterElement, INormalizedCluster } from 'api-client/qbert.model'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import ListAction from 'core/actions/ListAction'
import CreateAction from 'core/actions/CreateAction'
import UpdateAction from 'core/actions/UpdateAction'
import { trackEvent } from 'utils/tracking'
import DeleteAction from 'core/actions/DeleteAction'
import CustomAction from 'core/actions/CustomAction'
import store from 'app/store'
import { cacheActions } from 'core/caching/cacheReducers'

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

const clusterActions = new ActionsSet({
  cacheKey: DataKeys.Clusters,
  uniqueIdentifier: 'uuid',
})

export default clusterActions

export type Cluster = ClusterElement &
  INormalizedCluster & {
    csiDrivers: any[]
    progressPercent: string
    version: string
    baseUrl: string
  }

// eslint-disable-next-line @typescript-eslint/require-await
export const listClusters = clusterActions.add(
  new ListAction<Cluster[]>(async () => {
    const rawClusters = Promise.all([
      qbert.getClusters(),
      // Fetch dependent entities
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
  }),
)

type ClusterType = 'aws' | 'azure' | 'local'

export const createCluster = clusterActions.add(
  new CreateAction<INormalizedCluster>(async (params: { clusterType: ClusterType }) => {
    if (params.clusterType === 'aws') {
      return createAwsCluster(params)
    }
    if (params.clusterType === 'azure') {
      return createAzureCluster(params)
    }
    if (params.clusterType === 'local') {
      return createBareOSCluster(params)
    }
    return null
  }),
)

export const updateCluster = clusterActions.add(
  new UpdateAction(
    async (params: {
      uuid: string
      name: string
      tags: string
      numWorkers: number
      numMinWorkers: number
      numMaxWorkers: number
      etcdBackup: any
    }) => {
      const { uuid } = params
      const updateableParams = 'name tags numWorkers numMinWorkers numMaxWorkers'.split(' ')

      const body = pick(updateableParams, params)
      body.etcdBackup = getEtcdBackupPayload('etcdBackup', params)

      await qbert.updateCluster(uuid, body)
      trackEvent('Update Cluster', { uuid })

      // Doing this will help update the table, but the cache remains incorrect...
      // Same issue regarding cache applies to anything else updated this function
      // body.etcdBackupEnabled = !!body.etcdBackup
      // clusterActions.invalidateCache()
      return body
    },
  ),
)

export const deleteCluster = clusterActions.add(
  new DeleteAction(async ({ uuid }: { uuid: string }) => {
    await qbert.deleteCluster(uuid)
    // Delete cluster Segment tracking is done in ClusterDeleteDialog.tsx because that code
    // has more context about the cluster name, etc.

    // Refresh clusters since combinedHosts will still
    // have references to the deleted cluster.
    // loadCombinedHosts.invalidateCache()
  }),
)

export const scaleCluster = clusterActions.add(
  new CustomAction(
    'scaleCluster',
    async ({
      cluster,
      numSpotWorkers,
      numWorkers,
      spotPrice,
    }: {
      cluster: Cluster
      numWorkers: number
      numSpotWorkers: number
      spotPrice: number
    }) => {
      const body = {
        numWorkers,
        numSpotWorkers: numSpotWorkers || 0,
        spotPrice: spotPrice || 0.001,
        spotWorkerFlavor: cluster.cloudProperties.workerFlavor,
      }
      await qbert.updateCluster(cluster.uuid, body)
      trackEvent('Scale Cluster', { clusterUuid: cluster.uuid, numSpotWorkers, numWorkers })

      return {
        numWorkers,
      }
    },
    (result, params) => {
      // Update the cluster in the cache
      store.dispatch(
        cacheActions.updateItem({
          uniqueIdentifier: 'uuid',
          cacheKey: DataKeys.Clusters,
          params,
          item: result,
        }),
      )
    },
  ),
)

export const upgradeCluster = clusterActions.add(
  new CustomAction(
    'upgradeCluster',
    async ({ uuid }: { uuid: string }) => {
      await qbert.upgradeCluster(uuid)
      trackEvent('Upgrade Cluster', { clusterUuid: uuid })

      return {
        canUpgrade: false,
      }
    },
    (result, params) => {
      // Update the cluster in the cache
      store.dispatch(
        cacheActions.updateItem({
          uniqueIdentifier: 'uuid',
          cacheKey: DataKeys.Clusters,
          params,
          item: result,
        }),
      )
    },
  ),
)

export const updateTag = clusterActions.add(
  new CustomAction(
    'updateTag',
    async ({ cluster, key, val }: { cluster: Cluster; key: string; val: string }) => {
      const body = {
        tags: { ...(cluster.tags || {}), [key]: val },
      }

      await qbert.updateCluster(cluster.uuid, body)

      return body
    },
    (result, params) => {
      // Update the cluster in the cache
      store.dispatch(
        cacheActions.updateItem({
          uniqueIdentifier: 'uuid',
          cacheKey: DataKeys.Clusters,
          params,
          item: result,
        }),
      )
    },
  ),
)

export const attachNodes = clusterActions.add(
  new CustomAction(
    'attachNodes',
    async ({ cluster, nodes }: { cluster: Cluster; nodes: any[] }) => {
      await qbert.attach(cluster.uuid, nodes)
      trackEvent('Cluster Attach Nodes', {
        numNodes: (nodes || []).length,
        clusterUuid: cluster.uuid,
      })
      return null
    },
    () => {
      // Clear the combined hosts cache
      store.dispatch(
        cacheActions.clearCache({
          cacheKey: DataKeys.CombinedHosts,
        }),
      )
    },
  ),
)

export const detachNodes = clusterActions.add(
  new CustomAction(
    'detachNodes',
    async ({ cluster, nodes }: { cluster: Cluster; nodes: any[] }) => {
      await qbert.detach(cluster.uuid, nodes)
      trackEvent('Cluster Detach Nodes', {
        numNodes: (nodes || []).length,
        clusterUuid: cluster.uuid,
      })
      return null
    },
    () => {
      // Clear the combined hosts cache
      store.dispatch(
        cacheActions.clearCache({
          cacheKey: DataKeys.CombinedHosts,
        }),
      )
    },
  ),
)

// If params.clusterId is not assigned it fetches all clusters
// and extracts the clusterId from the first cluster
// It also adds a "clusters" param that contains all the clusters, just for convenience
export const parseClusterParams = async (params): Promise<[string, Cluster[]]> => {
  const clusters = await listClusters.call(params)
  const { clusterId = pathOr(allKey, [0, 'uuid'], clusters) } = params
  return [clusterId, clusters]
}
