import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { mapAsync } from 'utils/async'

const { qbert } = ApiClient.getInstance()

const loggingActions = createCRUDActions(ActionDataKeys.Loggings, {
  listFn: async (params) => {
    const clusters = await clusterActions.list()
    return mapAsync(async (cluster) => {
      return {
        ...(await qbert.getLoggings(cluster.uuid)),
        clusterId: cluster.uuid, // FIXME: just making sure the clusterId gets returned here
      }
    }, clusters)
  },
  createFn: async (data) => {
    return qbert.createLogging(data)
  },
  deleteFn: async ({ cluster }) => {
    await qbert.deleteLogging(cluster)
  },
  updateFn: async (data) => {
    return qbert.updateLogging(data)
  },
})

export default loggingActions
