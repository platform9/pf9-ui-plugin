import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { intersection } from 'ramda'
import { importedClustersSelector, makeImportedClustersSelector } from './selectors'

const acceptedApiVersions = ['v1alpha2']

const { qbert } = ApiClient.getInstance()

export const getImportedClusters = async () => {
  await qbert.getImportedClusters()
}

export const importedClusterActions = createCRUDActions(ActionDataKeys.ImportedClusters, {
  listFn: async () => {
    const rawSunpikeApis = await qbert.getSunpikeApis()
    const sunpikeApis = rawSunpikeApis.versions?.map((version) => version.version)
    if (!intersection(sunpikeApis, acceptedApiVersions).length) {
      // If API is not supported yet, return an empty array
      return []
    }
    const importedClusters = await qbert.getImportedClusters()
    return importedClusters
  },
  deleteFn: async ({ uuid }) => {
    await qbert.deregisterExternalCluster(uuid)
  },
  uniqueIdentifier: 'uuid',
  selector: importedClustersSelector,
  selectorCreator: makeImportedClustersSelector,
})
