import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { importedClustersSelector, makeImportedClustersSelector } from './selectors'

const { qbert } = ApiClient.getInstance()

export const getImportedClusters = async () => {
  await qbert.getImportedClusters()
}

export const importedClusterActions = createCRUDActions(ActionDataKeys.ImportedClusters, {
  listFn: async () => {
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
