import { createSelector } from 'reselect'
import { propOr } from 'ramda'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import getDataSelector from 'core/utils/getDataSelector'
import DataKeys from 'k8s/DataKeys'

const parseLoggings = (cluster, loggings) => {
  const logStorage = []
  const logDestination = []
  propOr([], 'items', loggings).forEach((item) => {
    if (item.spec.type === 'elasticsearch') {
      logStorage.push('ElasticSearch')
      const urlParam = item.spec.params.find((param) => param.name === 'url')
      logDestination.push(urlParam.value)
    } else if (item.spec.type === 's3') {
      logStorage.push('AWS-S3')
      const bucketParam = item.spec.params.find((param) => param.name === 's3_bucket')
      logDestination.push(bucketParam.value)
    }
  })

  return {
    id: cluster.uuid,
    cluster: cluster.uuid,
    clusterName: cluster.name,
    status: cluster.status,
    logStorage,
    logDestination,
  }
}
export const loggingsSelectors = createSelector(
  [getDataSelector<DataKeys.Loggings>(DataKeys.Loggings), clustersSelector],
  (rawLoggings, clusters) => {
    return clusters.reduce((acc, cluster) => {
      const loggings = rawLoggings.filter((rawLogging) => rawLogging.clusterId === cluster.uuid)
      return loggings ? [...acc, parseLoggings(cluster, loggings)] : acc
    }, [])
  },
)
