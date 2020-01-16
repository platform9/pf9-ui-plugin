import createCRUDActions from 'core/helpers/createCRUDActions'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'

export const kubeConfigCacheKey = 'apiAccess-kubeConfig'

const kubeConfigActions = createCRUDActions(kubeConfigCacheKey, {
  uniqueIdentifier: 'uuid',
  sortWith: (clusters, params) => {
    return clusters.sort(
      (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    )
  },
  listFn: async (params, loadFromContext) => loadFromContext(clustersCacheKey),
})

export default kubeConfigActions
