import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { pluck } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { loadCombinedHosts } from ' k8s/components/infrastructure/common/actions'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { makeCloudProvidersSelector } from 'k8s/components/infrastructure/cloudProviders/selectors'
import DataKeys from 'k8s/DataKeys'

const { qbert } = ApiClient.getInstance()

export const cloudProviderActions = createCRUDActions(DataKeys.CloudProviders, {
  listFn: async () => {
    const [cloudProviders] = await Promise.all([
      qbert.getCloudProviders(),
      // Make sure the derived data gets loaded as well
      clusterActions.list(),
      loadCombinedHosts(),
    ])
    return cloudProviders
  },
  createFn: async (params) => {
    const result = await qbert.createCloudProvider(params)
    const { uuid } = result || {}

    // TODO why does the detail request not return the nodepooluuid?
    const data = await qbert.getCloudProviders()
    const cloudProvider = data.find((cp) => cp.uuid === uuid) || {}
    return { ...cloudProvider }
  },
  updateFn: ({ uuid, ...data }) => qbert.updateCloudProvider(uuid, data),
  deleteFn: ({ uuid }) => qbert.deleteCloudProvider(uuid),
  customOperations: {
    attachNodesToCluster: async ({ clusterUuid, nodes }, currentItems) => {
      const nodeUuids = pluck('uuid', nodes)
      await qbert.attach(clusterUuid, nodes)
      // Assign nodes to their clusters in the context as well so the user
      // can't add the same node to another cluster.
      return currentItems.map((node) =>
        nodeUuids.includes(node.uuid) ? { ...node, clusterUuid } : node,
      )
    },
    detachNodesFromCluster: async ({ clusterUuid, nodeUuids }, currentItems) => {
      await qbert.detach(clusterUuid, nodeUuids)
      return currentItems.map((node) =>
        nodeUuids.includes(node.uuid) ? { ...node, clusterUuid: null } : node,
      )
    },
  },
  uniqueIdentifier: 'uuid',
  selector: makeCloudProvidersSelector,
})

export const loadCloudProviderDetails = createContextLoader(
  DataKeys.CloudProviderDetails,
  async ({ cloudProviderId }) => {
    const response = await qbert.getCloudProviderDetails(cloudProviderId)
    return response.Regions
  },
  {
    uniqueIdentifier: 'RegionName',
    indexBy: 'cloudProviderId',
  },
)

export const loadCloudProviderRegionDetails = createContextLoader(
  DataKeys.CloudProviderRegionDetails,
  async ({ cloudProviderId, cloudProviderRegionId }) => {
    return qbert.getCloudProviderRegionDetails(cloudProviderId, cloudProviderRegionId)
  },
  {
    uniqueIdentifier: ['cloudProviderId', 'cloudProviderRegionId'],
    indexBy: ['cloudProviderId', 'cloudProviderRegionId'],
  },
)
