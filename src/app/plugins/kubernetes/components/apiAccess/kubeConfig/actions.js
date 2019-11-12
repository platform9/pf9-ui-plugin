import createCRUDActions from 'core/helpers/createCRUDActions'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'

export const kubeConfigCacheKey = 'apiAccess-kubeConfig'

const kubeConfigActions = createCRUDActions(kubeConfigCacheKey, {
  // TODO: implement list fetching real data
  listFn: async (params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)
    return clusters.map(cluster => ({ cluster: cluster.name, url: cluster.kubeconfigUrl }))
  }
})

export default kubeConfigActions
