import { pluck } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { asyncFlatMap } from 'utils/fp'
import { allKey } from 'app/constants'
import { parseClusterParams } from 'k8s/components/infrastructure/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'

const { qbert } = ApiClient.getInstance()

const uniqueIdentifier = 'id'
const indexBy = 'clusterId'

export const appActions = createCRUDActions('apps', {
  listFn: async (params, loadFromContext) => {
    const [ clusterId, clusters ] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return asyncFlatMap(pluck('uuid', clusters), qbert.getCharts)
    }
    return qbert.getCharts(clusterId)
  },
  uniqueIdentifier,
  indexBy,
})

export const releaseActions = createCRUDActions('releases', {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return asyncFlatMap(pluck('uuid', clusters), qbert.getReleases)
    }
    return qbert.getReleases(clusterId)
  },
  uniqueIdentifier,
  indexBy,
})

export const repositoryActions = createCRUDActions('repositories', {
  listFn: async () => {
    const { data } = await qbert.getRepositories()
    return data
  },
  uniqueIdentifier,
})
