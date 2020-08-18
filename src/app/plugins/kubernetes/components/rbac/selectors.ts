import { createSelector } from 'reselect'
import createSorter from 'core/helpers/createSorter'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { whereEq, pipe, mergeLeft } from 'ramda'
import { makeParamsClustersSelector } from '../infrastructure/clusters/selectors'
import { pathStr } from 'utils/fp'

export const apiGroupsSelector = createSelector(
  [
    getDataSelector(DataKeys.ApiGroups, 'clusterId'),
    getDataSelector(DataKeys.CoreApiResources, 'clusterId'),
    getDataSelector(DataKeys.ApiResources, 'clusterId'),
  ],
  (apiGroups, coreApiResources, apiResources) => {
    const coreApiGroupWithResources = {
      name: 'core',
      groupVersion: 'core',
      resources: coreApiResources,
    }
    return [
      coreApiGroupWithResources,
      ...apiGroups.map((apiGroup) => {
        const {
          clusterId,
          name,
          preferredVersion: { groupVersion },
        } = apiGroup
        return {
          name,
          groupVersion,
          clusterId,
          resources: apiResources.filter(whereEq({ clusterId, apiGroup: groupVersion })),
        }
      }),
    ]
  },
)

export const makGroupseParamsapiSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [apiGroupsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (clusters, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(clusters)
    },
  )
}

// TODO: Xan
export const rolesSelector = createSelector(
  // [clustersSelector({ healthyClusters: true })], // do you mean to use `makeParamsClustersSelector({ healthyClusters: true })` here?
  [makeParamsClustersSelector({ healthyClusters: true })], // do you mean to use `makeParamsClustersSelector({ healthyClusters: true })` here?
  (items) => {
    return items.map((item) => ({
      ...item,
      id: pathStr('metadata.uid', item),
      name: pathStr('metadata.name', item),
      namespace: pathStr('metadata.namespace', item),
      clusterName: pipe(find(propEq('uuid', item.clusterId)), prop('name'))(items),
      created: pathStr('metadata.creationTimestamp', item),
      pickerLabel: `Role: ${item.metadata.name}`,
      pickerValue: `Role:${item.metadata.name}`,
    }))
  },
)
