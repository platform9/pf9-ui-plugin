import ApiClient from 'api-client/ApiClient'
import { propEq, pluck, pipe, find, prop, map, flatten } from 'ramda'
import yaml from 'js-yaml'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { someAsync } from 'utils/async'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import { allKey, notFoundErr } from 'app/constants'
import { pathStr } from 'utils/fp'
import { trackEvent } from 'utils/tracking'

const { qbert } = ApiClient.getInstance()

export const storageClassesCacheKey = 'storageClasses'

const storageClassActions = createCRUDActions(storageClassesCacheKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterStorageClasses)).then(flatten)
    }
    return qbert.getClusterStorageClasses(clusterId)
  },
  deleteFn: async ({ id }, currentItems) => {
    const item = currentItems.find(propEq('id', id))
    if (!item) {
      throw new Error(notFoundErr)
    }
    const { clusterId, name } = item
    const result = await qbert.deleteStorageClass(clusterId, name)
    trackEvent('Delete Storage', { clusterId, name })
    return result
  },
  createFn: async ({ clusterId, storageClassYaml }) => {
    const body = yaml.safeLoad(storageClassYaml)
    const created = await qbert.createStorageClass(clusterId, body)
    trackEvent('Create Storage Class', {
        id: pathStr('metadata.uid', created),
        name: pathStr('metadata.name', created),
    })
    return created
  },
  dataMapper: async (items, params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey, params)
    return map(
      (storageClass) => ({
        ...storageClass,
        id: pathStr('metadata.uid', storageClass),
        name: pathStr('metadata.name', storageClass),
        clusterName: pipe(find(propEq('uuid', storageClass.clusterId)), prop('name'))(clusters),
        type: pathStr('parameters.type', storageClass),
        created: pathStr('metadata.creationTimestamp', storageClass),
      }),
      items,
    )
  },
  uniqueIdentifier: 'metadata.uid',
  indexBy: 'clusterId',
  entityName: 'Storage Class',
})

export default storageClassActions
