import { createSelector } from 'reselect'
import { find, mergeLeft, pipe, prop, propEq } from 'ramda'
import { pipeWhenTruthy } from 'utils/fp'
import { combinedHostsSelector } from 'k8s/components/infrastructure/common/selectors'
import createSorter from 'core/helpers/createSorter'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { ICombinedHost } from 'k8s/components/infrastructure/common/model'
import { calculateNodeUsages } from '../common/helpers'

export const nodesSelector = createSelector(
  [
    getDataSelector<DataKeys.Nodes>(DataKeys.Nodes),
    combinedHostsSelector,
    getDataSelector<DataKeys.ServiceCatalog>(DataKeys.ServiceCatalog),
  ],
  (rawNodes, combinedHosts, rawServiceCatalog) => {
    const combinedHostsObj = combinedHosts.reduce((accum, host) => {
      const id = host?.resmgr?.id || host?.qbert?.uuid || null
      accum[id] = host
      return accum
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    }, {} as { [key: string]: ICombinedHost })
    const qbertUrl =
      pipeWhenTruthy(find(propEq('name', 'qbert')), prop('url'))(rawServiceCatalog) || ''

    // associate nodes with the combinedHost entry
    return rawNodes.map((node) => {
      const usage = calculateNodeUsages([combinedHostsObj[node.uuid]]) // expects array
      return {
        ...node,
        // if hostagent is not responding, then the nodes info is outdated
        // set the status to disconnected manually
        status: combinedHostsObj[node.uuid].responding ? node.status : 'disconnected',
        combined: combinedHostsObj[node.uuid],
        // qbert v3 link fails authorization so we have to use v1 link for logs
        logs: `${qbertUrl}/logs/${node.uuid}`.replace(/v3/, 'v1'),
        usage,
      }
    })
  },
)

export const makeParamsNodesSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [nodesSelector, (_, params) => mergeLeft(params, defaultParams)],
    (nodes, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(nodes)
    },
  )
}
