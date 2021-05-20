import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { mapAsync } from 'utils/async'

const { qbert } = ApiClient.getInstance()

const loggingActions = createCRUDActions(ActionDataKeys.Loggings, {
  listFn: async (params) => {
    Bugsnag.leaveBreadcrumb('Attempting to get loggins')
    const clusters = await clusterActions.list()
    return mapAsync(async (cluster) => {
      return {
        ...(await qbert.getLoggings(cluster.uuid)),
        clusterId: cluster.uuid, // FIXME: just making sure the clusterId gets returned here
      }
    }, clusters)
  },
  createFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to create logging', data)
    return qbert.createLogging(data)
  },
  deleteFn: async ({ cluster }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete logging', { cluster })
    await qbert.deleteLogging(cluster)
  },
  updateFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to update logging', data)
    return qbert.updateLogging(data)
  },
})

export default loggingActions
