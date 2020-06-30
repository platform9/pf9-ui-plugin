import { createSelector } from 'reselect'
import { pipe, filter, map, pluck, propSatisfies, propEq, pathOr } from 'ramda'
import { capitalizeString } from 'utils/misc'
import { pathStrOr, emptyArr } from 'utils/fp'
import { dataStoreKey, cacheStoreKey } from 'core/caching/cacheReducers'
import createSorter from 'core/helpers/createSorter'
import calcUsageTotalByPath from 'k8s/util/calcUsageTotals'
import { cloudProvidersCacheKey } from './actions'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import { combinedHostsSelector } from 'k8s/components/infrastructure/common/selectors'
import getParamsSelector from 'core/helpers/getParamsSelector'

const cloudProviderTypes = {
  aws: 'Amazon AWS Provider',
  azure: 'Microsoft Azure Provider',
  openstack: 'OpenStack',
}

export const cloudProvidersSelector = createSelector([
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, cloudProvidersCacheKey]),
  clustersSelector,
  combinedHostsSelector
], (cloudProviders, clusters, combinedHosts) => {
  const getNodesHosts = (nodeIds) =>
    combinedHosts.filter(propSatisfies((id) => nodeIds.includes(id), 'id'))
  const usagePathStr = 'resmgr.extensions.resource_usage.data'

  return pipe(
    filter(({ type }) => type !== 'local'),
    map((cloudProvider) => {
      const descriptiveType =
        cloudProviderTypes[cloudProvider.type] || capitalizeString(cloudProvider.type)
      const filterCpClusters = propEq('nodePoolUuid', cloudProvider.nodePoolUuid)
      const cpClusters = clusters.filter(filterCpClusters)
      const cpNodes = pluck('nodes', cpClusters).flat()
      const cpHosts = getNodesHosts(pluck('uuid', cpNodes))
      const calcDeployedCapacity = calcUsageTotalByPath(cpHosts)
      const deployedCapacity = {
        compute: calcDeployedCapacity(`${usagePathStr}.cpu.used`, `${usagePathStr}.cpu.total`),
        memory: calcDeployedCapacity(
          (item) =>
            pathStrOr(0, `${usagePathStr}.memory.total`, item) -
            pathStrOr(0, `${usagePathStr}.memory.available`, item),
          `${usagePathStr}.memory.total`
        ),
        disk: calcDeployedCapacity(`${usagePathStr}.disk.used`, `${usagePathStr}.disk.total`),
      }

      return {
        ...cloudProvider,
        descriptiveType,
        deployedCapacity,
        clusters: cpClusters,
        nodes: cpNodes,
      }
    }),
  )(cloudProviders)
})

export const makeCloudProvidersSelector = (defaultParams = {
  orderBy: 'created_at',
  orderDirection: 'desc'
}) => {
  return createSelector(
    [cloudProvidersSelector, getParamsSelector(defaultParams)],
    (cloudProviders, params) => {
      const {
        orderBy,
        orderDirection,
      } = params
      return pipe(
        createSorter({ orderBy, orderDirection })
      )(cloudProviders)
    }
  )
}

