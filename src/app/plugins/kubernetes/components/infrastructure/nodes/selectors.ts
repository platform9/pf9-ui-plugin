import { createSelector } from 'reselect'
import { pathOr, find, propEq, prop, mergeLeft, pipe } from 'ramda'
import { emptyArr, pathStrOrNull, pipeWhenTruthy } from 'utils/fp'
import { dataStoreKey, cacheStoreKey } from 'core/caching/cacheReducers'
import { nodesCacheKey } from 'k8s/components/infrastructure/nodes/actions'
import { combinedHostsSelector } from 'k8s/components/infrastructure/common/selectors'
import { serviceCatalogContextKey } from 'openstack/components/api-access/actions'
import createSorter from 'core/helpers/createSorter'

export const nodesSelector = createSelector(
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, nodesCacheKey]),
  combinedHostsSelector,
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, serviceCatalogContextKey]),
  (rawNodes, combinedHosts, serviceCatalog) => {
    const combinedHostsObj = combinedHosts.reduce((accum, host) => {
      const id = pathStrOrNull('resmgr.id')(host) || pathStrOrNull('qbert.uuid')(host)
      accum[id] = host
      return accum
    }, {})

    const qbertUrl =
      pipeWhenTruthy(find(propEq('name', 'qbert')), prop('url'))(serviceCatalog) || ''

    // associate nodes with the combinedHost entry
    return rawNodes.map((node) => ({
      ...node,
      combined: combinedHostsObj[node.uuid],
      // qbert v3 link fails authorization so we have to use v1 link for logs
      logs: `${qbertUrl}/logs/${node.uuid}`.replace(/v3/, 'v1'),
    }))
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
