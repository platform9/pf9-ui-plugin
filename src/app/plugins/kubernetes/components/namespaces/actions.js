import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import DataKeys from 'k8s/DataKeys'
import { flatten, pluck } from 'ramda'
import { someAsync } from 'utils/async'
import { pathStr } from 'utils/fp'
import { trackEvent } from 'utils/tracking'

const { qbert } = ApiClient.getInstance()

export const namespacesCacheKey = 'namespaces'

const namespaceActions = createCRUDActions(DataKeys.Namespaces, {
  listFn: async (params) => {
    const [clusterId, clusters] = await parseClusterParams(params)
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterNamespaces)).then(flatten)
    }
    return qbert.getClusterNamespaces(clusterId)
  },
  createFn: async ({ clusterId, name }) => {
    const body = { metadata: { name } }
    const created = await qbert.createNamespace(clusterId, body)
    trackEvent('WZ Create New Namespace', {
      id: pathStr('metadata.uid', created),
      clusterId,
      name,
      wizard_step: 'Create Namespace',
      wizard_state: 'Complete',
      wizard_progress: '1 of 1',
      wizard_name: 'Create New Namespace',
    })
    return created
  },
  deleteFn: async ({ id }, currentItems) => {
    const { clusterId, name } = currentItems.find((ns) => ns.id === id)
    const response = await qbert.deleteNamespace(clusterId, name)
    trackEvent('WZ Delete Namespace', {
      id,
      clusterId,
      name,
      wizard_step: 'Delete Namespace',
      wizard_state: 'Complete',
      wizard_progress: '1 of 1',
      wizard_name: 'Deleted Namespace',
    })
    return response
  },
  uniqueIdentifier: 'id',
  indexBy: 'clusterId',
})

export default namespaceActions
