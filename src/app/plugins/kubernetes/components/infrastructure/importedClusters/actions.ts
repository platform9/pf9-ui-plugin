import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { intersection } from 'ramda'
import { clusterTagActions } from '../clusters/actions'
import { importedClustersSelector, makeParamsImportedClustersSelector } from './selectors'

const acceptedApiVersions = ['v1alpha2']

const { qbert } = ApiClient.getInstance()

export const getImportedClusters = async () => {
  Bugsnag.leaveBreadcrumb('Attempting to get imported clusters')
  await qbert.getImportedClusters()
}

export const importedClusterActions = createCRUDActions(ActionDataKeys.ImportedClusters, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get imported clusters')
    try {
      const rawSunpikeApis = await qbert.getSunpikeApis()
      const sunpikeApis = rawSunpikeApis.versions?.map((version) => version.version)
      if (!intersection(sunpikeApis, acceptedApiVersions).length) {
        // If API is not supported yet, return an empty array
        return []
      }
    } catch (err) {
      return []
    }
    // update to use allSettled as appbert sometimes is in a failed state.
    const [settledClusters] = await Promise.allSettled([
      qbert.getImportedClusters(),
      // Fetch dependent caches
      clusterTagActions.list(),
    ])
    if (settledClusters.status !== 'fulfilled') {
      return []
    }
    return settledClusters.value
  },
  deleteFn: async ({ uuid }) => {
    Bugsnag.leaveBreadcrumb('Attempting to detach imported cluster', { clusterId: uuid })
    await qbert.deregisterExternalCluster(uuid)
  },
  uniqueIdentifier: 'uuid',
  selector: importedClustersSelector,
  selectorCreator: makeParamsImportedClustersSelector,
})
