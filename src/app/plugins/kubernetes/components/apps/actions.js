import { pluck } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { asyncFlatMap } from 'utils/fp'
import { allKey } from 'app/constants'
import { parseClusterParams } from 'k8s/components/infrastructure/actions'

export const loadApps = createContextLoader('apps', async (params, loadFromContext) => {
  const [ clusterId, clusters ] = await parseClusterParams(params, loadFromContext)
  const { qbert } = ApiClient.getInstance()
  if (clusterId === allKey) {
    return asyncFlatMap(pluck('uuid', clusters), qbert.getCharts)
  }
  return qbert.getCharts(clusterId)
}, {
  uniqueIdentifier: 'id',
  indexBy: 'clusterId',
})

export const loadReleases = createContextLoader('releases', async (params, loadFromContext) => {
  const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
  const { qbert } = ApiClient.getInstance()
  if (clusterId === allKey) {
    return asyncFlatMap(pluck('uuid', clusters), qbert.getReleases)
  }
  return qbert.getReleases(clusterId)
}, {
  uniqueIdentifier: 'id',
  indexBy: 'clusterId',
})

export const deleteRelease = async () => {
  // TODO
}

export const loadRepositories = createContextLoader('repositories', async () => {
  const { qbert } = ApiClient.getInstance()
  const { data } = qbert.getRepositories()
  return data
}, {
  uniqueIdentifier: 'id',
  indexBy: 'clusterId',
})

export const deleteRepository = createContextUpdater('repositories', async (params, currentItems) => {
  // TODO
})

export const editApp = async ({ id, context, setContext }) => {}

export const downloadApp = async () => {}

export const deleteApp = async () => {}

export const addAppToEnvironment = async () => {}

export const deployApp = async () => {}
