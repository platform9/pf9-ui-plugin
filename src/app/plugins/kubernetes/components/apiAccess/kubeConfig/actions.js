import createCRUDActions from 'core/helpers/createCRUDActions'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'
import ApiClient from 'api-client/ApiClient'

const { qbert } = ApiClient.getInstance()

export const kubeConfigCacheKey = 'apiAccess-kubeConfig'

const kubeConfigActions = createCRUDActions(kubeConfigCacheKey, {
  listFn: async (params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)
    return clusters.map(cluster => ({
      clusterId: cluster.uuid,
      cluster: cluster.name,
      url: cluster.externalDnsName,
      kubeconfigUrl: cluster.kubeconfigUrl,
    }))
  },
  customOperations: {
    getKubeconfig: async ({ clusterId }) => {
      const kubeconfig = await qbert.getKubeConfig(clusterId)
      console.log({ kubeconfig })
      return kubeconfig
    },
  },
})

export default kubeConfigActions
