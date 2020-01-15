import createCRUDActions from 'core/helpers/createCRUDActions'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'

export const kubeConfigCacheKey = 'apiAccess-kubeConfig'

const kubeConfigActions = createCRUDActions(kubeConfigCacheKey, {
  uniqueIdentifier: 'clusterId',
  sortWith: (clusters, params) => {
    return clusters.sort(
      (a, b) => a.cluster.toLowerCase().localeCompare(b.cluster.toLowerCase())
    )
  },
  listFn: async (params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)
    return clusters.map((cluster) => ({
      clusterId: cluster.uuid,
      cluster: cluster.name || '', // incase any clusters dont have a name and we call toLowerCase
      url: cluster.externalDnsName,
      kubeconfigUrl: cluster.kubeconfigUrl,
    }))
  },
})

export default kubeConfigActions
