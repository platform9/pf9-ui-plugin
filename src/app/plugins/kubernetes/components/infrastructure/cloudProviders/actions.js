import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { makeCloudProvidersSelector } from 'k8s/components/infrastructure/cloudProviders/selectors'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { pluck } from 'ramda'
import { trackEvent } from 'utils/tracking'

const { qbert } = ApiClient.getInstance()

export const cloudProviderActions = createCRUDActions(ActionDataKeys.CloudProviders, {
  listFn: async () => {
    const [cloudProviders] = await Promise.all([
      qbert.getCloudProviders(),
      // Make sure the derived data gets loaded as well
      clusterActions.list(),
    ])
    return cloudProviders
  },
  createFn: async (params) => {
    const result = await qbert.createCloudProvider(params)
    trackEvent('Create Cloud Provider', {
      cloud_provider_name: params.name,
      cloud_provider_type: params.type,
    })
    const { uuid } = result || {}

    // TODO why does the detail request not return the nodepooluuid?
    const data = await qbert.getCloudProviders()
    const cloudProvider = data.find((cp) => cp.uuid === uuid) || {}
    return { ...cloudProvider }
  },
  updateFn: async ({ uuid, ...data }) => {
    const result = await qbert.updateCloudProvider(uuid, data)
    trackEvent('Update Cloud Provider', { uuid })
    return result
  },
  deleteFn: async ({ uuid, name, type }) => {
    const result = await qbert.deleteCloudProvider(uuid)
    trackEvent('Delete Cloud Provider', {
      uuid,
      cloud_provider_name: name,
      cloud_provider_type: type,
    })
    return result
  },
  customOperations: {
    attachNodesToCluster: async ({ clusterUuid, nodes }, currentItems) => {
      const nodeUuids = pluck('uuid', nodes)
      await qbert.attachNodes(clusterUuid, nodes)
      trackEvent('Attach node(s) to cluster', { clusterUuid, numNodes: (nodes || []).length })
      // Assign nodes to their clusters in the context as well so the user
      // can't add the same node to another cluster.
      return currentItems.map((node) =>
        nodeUuids.includes(node.uuid) ? { ...node, clusterUuid } : node,
      )
    },
    detachNodesFromCluster: async ({ clusterUuid, nodeUuids }, currentItems) => {
      await qbert.detachNodes(clusterUuid, nodeUuids)
      trackEvent('Detach node(s) from cluster', { clusterUuid, numNodes: (nodeUuids || []).length })
      return currentItems.map((node) =>
        nodeUuids.includes(node.uuid) ? { ...node, clusterUuid: null } : node,
      )
    },
  },
  uniqueIdentifier: 'uuid',
  selectorCreator: makeCloudProvidersSelector,
})

export const loadCloudProviderDetails = createContextLoader(
  ActionDataKeys.CloudProviderDetails,
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
  ActionDataKeys.CloudProviderRegionDetails,
  async ({ cloudProviderId, cloudProviderRegionId }) => {
    return qbert.getCloudProviderRegionDetails(cloudProviderId, cloudProviderRegionId)
  },
  {
    uniqueIdentifier: ['cloudProviderId', 'cloudProviderRegionId'],
    indexBy: ['cloudProviderId', 'cloudProviderRegionId'],
  },
)
