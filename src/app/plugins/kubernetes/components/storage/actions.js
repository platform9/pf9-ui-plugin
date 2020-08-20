import ApiClient from 'api-client/ApiClient'
import { allKey, notFoundErr } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import yaml from 'js-yaml'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import DataKeys from 'k8s/DataKeys'
import { flatten, pluck, propEq } from 'ramda'
import { someAsync } from 'utils/async'
import { storageClassSelector } from './selectors'

const { qbert } = ApiClient.getInstance()

const storageClassActions = createCRUDActions(DataKeys.StorageClasses, {
  listFn: async (params) => {
    const [clusterId, clusters] = await parseClusterParams(params)
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
