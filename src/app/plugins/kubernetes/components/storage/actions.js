import ApiClient from 'api-client/ApiClient'
import { propEq, pluck, pipe, find, prop, map, flatten } from 'ramda'
import yaml from 'js-yaml'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { someAsync } from 'utils/async'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import { allKey, notFoundErr } from 'app/constants'
import { storageClassSelector } from './selectors'
import DataKeys from 'k8s/DataKeys'

const { qbert } = ApiClient.getInstance()

const storageClassActions = createCRUDActions(DataKeys.StorageClasses, {
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
    await qbert.deleteStorageClass(clusterId, name)
  },
  createFn: async ({ clusterId, storageClassYaml }) => {
    const body = yaml.safeLoad(storageClassYaml)
    return qbert.createStorageClass(clusterId, body)
  },
  selector: storageClassSelector,
  uniqueIdentifier: 'metadata.uid',
  indexBy: 'clusterId',
  entityName: 'Storage Class',
})

export default storageClassActions
