import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import store from 'app/store'
import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import {
  createAwsCluster,
  createAzureCluster,
  createBareOSCluster,
  getKubernetesVersion,
  getProgressPercent,
  getEtcdBackupPayload,
  getMetalLbCidr,
} from 'k8s/components/infrastructure/clusters/helpers'
import {
  allClustersSelector,
  clustersSelector,
  makeParamsClustersSelector,
} from 'k8s/components/infrastructure/clusters/selectors'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { mergeLeft, pathOr, pick, propEq } from 'ramda'
import { mapAsync } from 'utils/async'
import { adjustWith, emptyObj, isNilOrEmpty, updateWith } from 'utils/fp'
import { trackEvent } from 'utils/tracking'
import { importedClusterActions } from '../importedClusters/actions'
import { importedClustersSelector } from '../importedClusters/selectors'

const { appbert, qbert } = ApiClient.getInstance()

export const clusterTagActions = createCRUDActions(ActionDataKeys.ClusterTags, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get cluster tags')
    return appbert.getClusterTags()
  },
  updateFn: async ({ clusterId, pkg, on }) => {
    Bugsnag.leaveBreadcrumb('Attempting to toggle addon', { clusterId, pkg, on })
    return appbert.toggleAddon(clusterId, pkg, on)
  },
  uniqueIdentifier: 'uuid',
})

const getCsiDrivers = async (clusterUuid) => {
  Bugsnag.leaveBreadcrumb('Attempting to get cluster CSI drivers', { clusterId: clusterUuid })
  try {
    return await qbert.getClusterCsiDrivers(clusterUuid)
  } catch (e) {
    console.warn(e)
    return null
  }
}

export const clusterActions = createCRUDActions(ActionDataKeys.Clusters, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get clusters')
    // update to use allSettled as appbert sometimes is in a failed state.
    const [settledClusters] = await Promise.allSettled([
      qbert.getClusters(),
      // Fetch dependent caches
      clusterTagActions.list(),
      loadNodes(emptyObj, true),
      loadResMgrHosts(),
    ])
    if (settledClusters.status !== 'fulfilled') {
      return []
    }
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
    }, settledClusters.value)
  },
  createFn: (params) => {
    Bugsnag.leaveBreadcrumb('Attempting to create cluster', params)
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
    const updateableParams = 'name tags numWorkers numMinWorkers numMaxWorkers kubernetesDashboard metricsServer'.split(
      ' ',
    )

    const body = pick(updateableParams, params)
    if (params.etcdBackup) {
      body.etcdBackup = getEtcdBackupPayload('etcdBackup', params)
    }

    if (params.enableMetallb) {
      body.enableMetallb = params.enableMetallb
      body.metallbCidr = getMetalLbCidr(params.metallbCidr)
    }

    Bugsnag.leaveBreadcrumb('Attempting to update cluster', { clusterId: uuid, ...body })
    await qbert.updateCluster(uuid, body)
    trackEvent('Update Cluster', { uuid })

    // Doing this will help update the table, but the cache remains incorrect...
    // Same issue regarding cache applies to anything else updated this function
    // body.etcdBackupEnabled = !!body.etcdBackup
    clusterActions.invalidateCache()
    return body
  },
  deleteFn: async ({ uuid }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete cluster', { clusterId: uuid })
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
      Bugsnag.leaveBreadcrumb('Attempting to scale cluster', { clusterId: cluster.uuid, ...body })
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
    upgradeCluster: async ({ cluster, upgradeType }, prevItems) => {
      Bugsnag.leaveBreadcrumb('Attempting to upgrade cluster', { clusterId: cluster.uuid })
      await qbert.upgradeCluster(cluster.uuid, upgradeType)
      trackEvent('Upgrade Cluster', { clusterUuid: cluster.uuid })

      // Multiple fields change on cluster upgrade, best to reload the entity to get updated values
      // Ideally the upgrade cluster call would return the updated entity
      const updatedCluster = await qbert.getClusterDetails(cluster.uuid)
      return adjustWith(propEq('uuid', cluster.uuid), mergeLeft(updatedCluster), prevItems)
    },
    updateTag: async ({ cluster, key, val }, prevItems) => {
      const body = {
        tags: { ...(cluster.tags || {}), [key]: val },
      }
      Bugsnag.leaveBreadcrumb('Attempting to update cluster tag', {
        clusterId: cluster.uuid,
        ...body,
      })
      await qbert.updateCluster(cluster.uuid, body)
      trackEvent('Cluster Tag Update', { clusterId: cluster.uuid })
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
      Bugsnag.leaveBreadcrumb('Attempting to attach nodes to cluster', {
        clusterId: cluster.uuid,
        numNodes: (nodes || []).length,
      })
      await qbert.attachNodes(cluster.uuid, nodes)
      trackEvent('Cluster Attach Nodes', {
        numNodes: (nodes || []).length,
        clusterUuid: cluster.uuid,
      })
      // loadCombinedHosts.invalidateCache()
      return prevItems
    },
    detachNodes: async ({ cluster, nodes }, prevItems) => {
      Bugsnag.leaveBreadcrumb('Attempting to detach nodes from cluster', {
        clusterId: cluster.uuid,
        numNodes: (nodes || []).length,
      })
      await qbert.detachNodes(cluster.uuid, nodes)
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
  // Maybe todo: change these to use the params selector instead to enable filtering?
  const allClusters = await getAllClusters()
  const { clusterId = pathOr(allKey, [0, 'uuid'], allClusters) } = params
  return [clusterId, allClusters]
}

export const loadSupportedRoleVersions = createContextLoader(
  ActionDataKeys.SupportedRoleVersions,
  async () => {
    const response = await qbert.getK8sSupportedRoleVersions()
    return response.roles
  },
  {
    uniqueIdentifier: 'uuid',
    cache: false,
  },
)

const allSelector = allClustersSelector()

export const getAllClusters = async (reload = false) => {
  if (reload) {
    await clusterActions.list()
    await importedClusterActions.list()
  } else {
    // Match useDataLoader method of checking for nil/empty on cache
    const normalClusters = clustersSelector(store.getState())
    const importedClusters = importedClustersSelector(store.getState())
    if (isNilOrEmpty(normalClusters)) {
      await clusterActions.list()
    }
    if (isNilOrEmpty(importedClusters)) {
      await importedClusterActions.list()
    }
  }
  const allClusters = allSelector(store.getState())
  return allClusters
}
