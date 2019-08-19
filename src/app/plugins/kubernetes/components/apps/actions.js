import { pluck } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { pipeAsync, asyncFlatMap } from 'utils/fp'
import { allKey } from 'app/constants'
import { parseClusterParams } from 'k8s/components/infrastructure/actions'

export const loadApps = createContextLoader('apps', pipeAsync(
  parseClusterParams,
  async ({ clusterId, clusters }) => {
    const { qbert } = ApiClient.getInstance()
    if (clusterId === allKey) {
      return asyncFlatMap(pluck('uuid', clusters), qbert.getCharts)
    }
    return qbert.getCharts(clusterId)
  }),
{ indexBy: 'clusterId' })

export const loadReleases = createContextLoader('releases', pipeAsync(
  parseClusterParams,
  async ({ clusterId, clusters }) => {
    const { qbert } = ApiClient.getInstance()
    if (clusterId === allKey) {
      return asyncFlatMap(pluck('uuid', clusters), qbert.getReleases)
    }
    return qbert.getReleases(clusterId)
  }),
{ indexBy: 'clusterId' })

export const deleteRelease = async ({ data, setContext, reload }) => {
  // TODO
}

export const loadRepositories = createContextLoader('repositories', async () => {
  const { qbert } = ApiClient.getInstance()
  const { data } = qbert.getRepositories()
  return data
})

export const deleteRepository = createContextUpdater('repositories', async (params, currentItems) => {
  // TODO
})

export const editApp = async ({ id, context, setContext }) => {}

export const downloadApp = async () => {}

export const deleteApp = async () => {}

export const addAppToEnvironment = async () => {}

export const deployApp = async () => {}
