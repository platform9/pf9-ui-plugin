import ApiClient from 'api-client/ApiClient'
import { ClusterElement, INormalizedCluster } from 'api-client/qbert.model'
import { allKey } from 'app/constants'
import store from 'app/store'
import ActionsSet from 'core/actions/ActionsSet'
import CreateAction from 'core/actions/CreateAction'
import CustomAction from 'core/actions/CustomAction'
import DeleteAction from 'core/actions/DeleteAction'
import ListAction from 'core/actions/ListAction'
import UpdateAction from 'core/actions/UpdateAction'
import { cacheActions } from 'core/caching/cacheReducers'
import createCRUDActions from 'core/helpers/createCRUDActions'
import {
  createAwsCluster,
  createAzureCluster,
  createBareOSCluster,
  getEtcdBackupPayload,
  getKubernetesVersion,
  getProgressPercent,
} from 'k8s/components/infrastructure/clusters/helpers'
import {
  allClustersSelector,
  clustersSelector,
} from 'k8s/components/infrastructure/clusters/selectors'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import DataKeys, { ActionDataKeys } from 'k8s/DataKeys'
import { Dictionary, pathOr, pick } from 'ramda'
import { mapAsync } from 'utils/async'
import { emptyObj, isNilOrEmpty } from 'utils/fp'
import { trackEvent } from 'utils/tracking'
import { importedClusterActions } from '../importedClusters/actions'
import { importedClustersSelector } from '../importedClusters/selectors'
import { IClusterAction } from 'k8s/components/infrastructure/clusters/model'

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

const clusterActions = new ActionsSet<'Clusters'>({
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
  new ListAction<'Clusters'>(async () => {
    const [rawClusters] = await Promise.all([
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
  new CreateAction<'Clusters', { clusterType: ClusterType }, INormalizedCluster>(async (params) => {
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
  new UpdateAction<
    'Clusters',
    {
      uuid: string
      name: string
      tags: string
      numWorkers: number
      numMinWorkers: number
      numMaxWorkers: number
      etcdBackup: any
    },
    any
  >(async (params) => {
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
  }),
)

export const deleteCluster = clusterActions.add(
  new DeleteAction<'Clusters', { uuid: string }, any>(async ({ uuid }) => {
    await qbert.deleteCluster(uuid)
    // Delete cluster Segment tracking is done in ClusterDeleteDialog.tsx because that code
    // has more context about the cluster name, etc.

    // Refresh clusters since combinedHosts will still
    // have references to the deleted cluster.
    // loadCombinedHosts.invalidateCache()
  }),
)

export const scaleCluster = clusterActions.add(
  new CustomAction<
    'Clusters',
    {
      cluster: Cluster
      numWorkers: number
      numSpotWorkers: number
      spotPrice: number
    },
    {
      numWorkers: number
    }
  >(
    'scaleCluster',
    async ({ cluster, numSpotWorkers, numWorkers, spotPrice }) => {
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
  new CustomAction<'Clusters', { uuid: string; upgradeType: string }, { canUpgrade: boolean }>(
    'upgradeCluster',
    async ({ uuid, upgradeType }) => {
      await qbert.upgradeCluster(uuid, upgradeType)
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
  new CustomAction<
    'Clusters',
    { cluster: Cluster; key: string; val: string },
    {
      tags: Dictionary<any> // TODO fix these typings
    }
  >(
    'updateTag',
    async ({ cluster, key, val }) => {
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
  new CustomAction<'Clusters', { cluster: Cluster; nodes: any[] }, void>(
    'attachNodes',
    async ({ cluster, nodes }) => {
      await qbert.attach(cluster.uuid, nodes)
      trackEvent('Cluster Attach Nodes', {
        numNodes: (nodes || []).length,
        clusterUuid: cluster.uuid,
      })
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
  new CustomAction<'Clusters', { cluster: Cluster; nodes: any[] }, void>(
    'detachNodes',
    async ({ cluster, nodes }: { cluster: Cluster; nodes: any[] }) => {
      await qbert.detach(cluster.uuid, nodes)
      trackEvent('Cluster Detach Nodes', {
        numNodes: (nodes || []).length,
        clusterUuid: cluster.uuid,
      })
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
export const parseClusterParams = async (params): Promise<[string, IClusterAction[]]> => {
  const clusters = await listClusters.call(params)
  const { clusterId = pathOr(allKey, [0, 'uuid'], clusters) } = params
  return [clusterId, clusters]
}

export const loadSupportedRoleVersions = new ListAction<'SupportedRoleVersions'>(
  async () => {
    return qbert.getK8sSupportedRoleVersions()
  },
  {
    uniqueIdentifier: 'uuid',
    cache: false,
  },
)

const allSelector = allClustersSelector()
// TODO: this has be improved, we shouldn't even need this function
export const getAllClusters = async (reload = false) => {
  if (reload) {
    await listClusters.call(emptyObj)
    await importedClusterActions.list()
  } else {
    // Match useDataLoader method of checking for nil/empty on cache
    const normalClusters = clustersSelector(store.getState(), emptyObj)
    const importedClusters = importedClustersSelector(store.getState(), emptyObj)
    if (isNilOrEmpty(normalClusters)) {
      await listClusters.call(emptyObj)
    }
    if (isNilOrEmpty(importedClusters)) {
      await importedClusterActions.list()
    }
  }
  const allClusters = allSelector(store.getState(), emptyObj)
  return allClusters
}
