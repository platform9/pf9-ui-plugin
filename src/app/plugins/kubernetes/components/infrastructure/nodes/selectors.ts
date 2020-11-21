import { createSelector } from 'reselect'
import { find, mergeLeft, pipe, prop, propEq } from 'ramda'
import { pipeWhenTruthy } from 'utils/fp'
import { combinedHostsSelector } from 'k8s/components/infrastructure/common/selectors'
import createSorter from 'core/helpers/createSorter'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { ICombinedHost } from 'k8s/components/infrastructure/common/model'
import { calculateNodeUsages } from '../common/helpers'
import { Resmgr } from './model'
import { Node } from 'api-client/qbert.model'

export const nodesSelector = createSelector(
  [
    getDataSelector<DataKeys.Nodes>(DataKeys.Nodes),
    combinedHostsSelector,
    getDataSelector<DataKeys.ServiceCatalog>(DataKeys.ServiceCatalog),
  ],
  (rawNodes: any, combinedHosts: any, rawServiceCatalog: any) => {
    const combinedHostsObj = combinedHosts.reduce((accum, host) => {
      const id = host?.resmgr?.id || host?.qbert?.uuid || null
      accum[id] = host
      return accum
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    }, {} as { [key: string]: ICombinedHost })

    const qbertUrl =
      pipeWhenTruthy(find(propEq('name', 'qbert')), prop('url'))(rawServiceCatalog) || ''

    // associate nodes with the combinedHost entry
    const finalNodes = rawNodes.map((node: Node | Resmgr) => {
      const isResmgr = (node: any): node is Resmgr => (node as Resmgr).id != undefined
      const nodeUuid = isResmgr(node) ? node.id : node.uuid
      const usage = calculateNodeUsages([combinedHostsObj[nodeUuid]]) // expects array

      return {
        ...(isResmgr(node) ? {} : node),
        name: isResmgr(node) ? node.info?.hostname : node.name,
        uuid: nodeUuid,
        isAuthorized: !isResmgr(node),
        // if hostagent is not responding, then the nodes info is outdated
        // set the status to disconnected manually
        status: isResmgr(node)
          ? undefined
          : combinedHostsObj[nodeUuid].responding
          ? node.status
          : 'disconnected',
        combined: combinedHostsObj[nodeUuid],
        // qbert v3 link fails authorization so we have to use v1 link for logs
        logs: `${qbertUrl}/logs/${nodeUuid}`.replace(/v3/, 'v1'),
        usage,
      }
    })

    return finalNodes
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
