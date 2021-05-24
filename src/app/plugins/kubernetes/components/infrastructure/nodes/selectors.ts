import { createSelector } from 'reselect'
import { mergeLeft, path, pathOr, pipe } from 'ramda'
import { combinedHostsSelector } from 'k8s/components/infrastructure/common/selectors'
import createSorter from 'core/helpers/createSorter'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { ICombinedHost } from 'k8s/components/infrastructure/common/model'
import { calculateNodeUsages } from '../common/helpers'
import { getScopedQbertEndpoint } from '../clusters/helpers'
import { clientStoreKey } from 'core/client/clientReducers'

export const nodesSelector = createSelector(
  [
    getDataSelector<DataKeys.Nodes>(DataKeys.Nodes),
    combinedHostsSelector,
    (state) => pathOr('', [clientStoreKey, 'endpoints', 'qbert'])(state),
  ],
  (rawNodes, combinedHosts, qbertEndpoint) => {
    const combinedHostsObj = combinedHosts.reduce((accum, host) => {
      const id = host?.resmgr?.id || host?.qbert?.uuid || null
      accum[id] = host
      return accum
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    }, {} as { [key: string]: ICombinedHost })

    // associate nodes with the combinedHost entry
    return rawNodes
      .map((node) => {
        const usage = calculateNodeUsages([combinedHostsObj[node.uuid]]) // expects array
        return {
          ...node,
          // if hostagent is not responding, then the nodes info is outdated
          // set the status to disconnected manually
          status: combinedHostsObj[node.uuid].responding ? node.status : 'disconnected',
          combined: combinedHostsObj[node.uuid],
          // qbert v3 link fails authorization so we have to use v1 link for logs
          logs: `${getScopedQbertEndpoint(qbertEndpoint)}/logs/${node.uuid}`,
          usage,
        }
      })
      .filter((node) => path(['combined', 'cloudStack'], node) !== 'openstack')
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
