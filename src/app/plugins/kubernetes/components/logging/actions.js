import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'

const { qbert } = ApiClient.getInstance()

const loggingActions = createCRUDActions('loggings', {
  listFn: async () => {
    return qbert.getLoggings()
  },
  createFn: async data => {
    return qbert.createLogging(data)
  },
  deleteFn: async ({ cluster }) => {
    await qbert.deleteLogging(cluster)
  },
  updateFn: async data => {
    return qbert.updateLogging(data)
  }
})

export default loggingActions
