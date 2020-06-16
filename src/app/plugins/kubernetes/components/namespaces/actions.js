import { pluck, flatten } from 'ramda'
import { allKey } from 'app/constants'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import { someAsync } from 'utils/async'
import { namespacesSelector } from 'k8s/components/namespaces/selectors'

const { qbert } = ApiClient.getInstance()

export const namespacesCacheKey = 'namespaces'

const namespaceActions = createCRUDActions(namespacesCacheKey, {
  listFn: async params => {
    const [clusterId, clusters] = await parseClusterParams(params)
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterNamespaces)).then(flatten)
    }
    return qbert.getClusterNamespaces(clusterId)
  },
  createFn: async ({ clusterId, name }) => {
    const body = { metadata: { name } }
    return qbert.createNamespace(clusterId, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    const { clusterId, name } = currentItems.find((ns) => ns.id === id)
    await qbert.deleteNamespace(clusterId, name)
  },
  uniqueIdentifier: 'id',
  indexBy: 'clusterId',
  selector: namespacesSelector,
})

export default namespaceActions
