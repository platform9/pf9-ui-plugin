import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import { allKey, notFoundErr } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import yaml from 'js-yaml'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import { storageClassSelector } from 'k8s/components/storage/selectors'
import { ActionDataKeys } from 'k8s/DataKeys'
import { flatten, pluck, propEq } from 'ramda'
import { someAsync } from 'utils/async'
import { pathStr } from 'utils/fp'
import { trackEvent } from 'utils/tracking'

const { qbert } = ApiClient.getInstance()

const storageClassActions = createCRUDActions(ActionDataKeys.StorageClasses, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    Bugsnag.leaveBreadcrumb('Attempting to get storage classes', { clusterId })
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
    Bugsnag.leaveBreadcrumb('Attempting to delete storage class', { clusterId, name })
    const result = await qbert.deleteStorageClass(clusterId, name)
    trackEvent('Delete Storage Class', { clusterId, name })
    return result
  },
  createFn: async ({ clusterId, storageClassYaml }) => {
    Bugsnag.leaveBreadcrumb('Attempting to create storage class', { clusterId, storageClassYaml })
    const body = yaml.safeLoad(storageClassYaml)
    const created = await qbert.createStorageClass(clusterId, body)
    trackEvent('Create Storage Class', {
      id: pathStr('metadata.uid', created),
      name: pathStr('metadata.name', created),
    })
    return created
  },
  uniqueIdentifier: 'metadata.uid',
  indexBy: 'clusterId',
  entityName: 'Storage Class',
  selector: storageClassSelector,
})

export default storageClassActions
