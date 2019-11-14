import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'
import { mapAsync } from 'utils/async'

const { qbert } = ApiClient.getInstance()

export const loggingsCacheKey = 'loggings'

const mapLoggings = (cluster, loggings) => {
  const logStorage = []
  const logDestination = []

  loggings.items.forEach(item => {
    if (item.spec.type === 'elasticsearch') {
      logStorage.push('ElasticSearch')
      const urlParam = item.spec.params.find(param => param.name === 'url')
      logDestination.push(urlParam.value)
    } else if (item.spec.type === 's3') {
      logStorage.push('AWS-S3')
      const bucketParam = item.spec.params.find(param => param.name === 's3_bucket')
      logDestination.push(bucketParam.value)
    }
  })

  return {
    cluster: cluster.id,
    clusterName: cluster.name,
    status: cluster.status,
    logStorage,
    logDestination,
  }
}

const loggingActions = createCRUDActions(loggingsCacheKey, {
  listFn: async (params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)

    const loggings = await mapAsync(async cluster => {
      const response = await qbert.getLoggings(cluster.uuid)
      return response ? mapLoggings(cluster, response) : null
    }, clusters)

    return loggings.filter(logStorage => logStorage != null)
  },
  createFn: async data => {
    return qbert.createLogging(data)
  },
  deleteFn: async ({ cluster }) => {
    await qbert.deleteLogging(cluster)
  },
  updateFn: async data => {
    return qbert.updateLogging(data)
  },
})

export default loggingActions
