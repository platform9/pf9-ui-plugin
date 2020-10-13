import { createSelector } from 'reselect'
import { filter, map, mergeLeft, pipe, pluck, propEq } from 'ramda'
import { capitalizeString } from 'utils/misc'
import createSorter from 'core/helpers/createSorter'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import { combinedHostsSelector } from 'k8s/components/infrastructure/common/selectors'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { GetCloudProvider } from 'api-client/qbert.model'

import { ICloudProvidersSelector } from './model'
import { calculateNodeUsages } from '../common/helpers'

export const cloudProviderTypes = {
  aws: 'AWS',
  azure: 'Azure',
  openstack: 'OpenStack',
  local: 'BareOS',
}

export const cloudProvidersSelector = createSelector(
  [
    getDataSelector<DataKeys.CloudProviders>(DataKeys.CloudProviders),
    clustersSelector,
    combinedHostsSelector,
  ],
  (cloudProviders, clusters, combinedHosts) => {
    return pipe<GetCloudProvider[], GetCloudProvider[], ICloudProvidersSelector[]>(
      filter<GetCloudProvider>(({ type }) => type !== 'local'),
      map((cloudProvider) => {
        const descriptiveType =
          cloudProviderTypes[cloudProvider.type] || capitalizeString(cloudProvider.type)
        const filterCpClusters = propEq('nodePoolUuid', cloudProvider.nodePoolUuid)
        const cpClusters = clusters.filter(filterCpClusters)
        const cpNodes = pluck('nodes', cpClusters).flat()
        const usage = calculateNodeUsages(cpNodes)
        return {
          ...cloudProvider,
          descriptiveType,
          deployedCapacity: usage,
          clusters: cpClusters,
          nodes: cpNodes,
        }
      }),
    )(cloudProviders)
  },
)

export const makeCloudProvidersSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [cloudProvidersSelector, (_, params) => mergeLeft(params, defaultParams)],
    (cloudProviders, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(cloudProviders)
    },
  )
}
