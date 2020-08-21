import { createSelector } from 'reselect'
import createSorter from 'core/helpers/createSorter'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { whereEq, pipe, mergeLeft, find, propEq, prop } from 'ramda'
// import { makeParamsClustersSelector } from '../infrastructure/clusters/selectors'
// import { GetClusterRolesItem, IGenericClusterizedResponse } from 'api-client/qbert.model'

export const apiGroupsSelector = createSelector(
  [
    getDataSelector<DataKeys.ApiGroups>(DataKeys.ApiGroups, 'clusterId'),
    getDataSelector<DataKeys.CoreApiResources>(DataKeys.CoreApiResources, 'clusterId'),
    getDataSelector<DataKeys.ApiResources>(DataKeys.ApiResources, 'clusterId'),
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

export const rolesSelector = createSelector(
  // [makeParamsClustersSelector({ healthyClusters: true })], // do you mean to use `makeParamsClustersSelector({ healthyClusters: true })` here?
  [getDataSelector<DataKeys.KubeRoles>(DataKeys.KubeRoles)],
  (items) => {
    return items.map((item) => ({
      ...item,
      id: item?.metadata?.uid,
      name: item?.metadata?.name,
      namespace: item?.metadata?.namespace,
      clusterName: pipe(find(propEq('uuid', item.clusterId)), prop<any>('name'))(items as any),
      created: item?.metadata?.creationTimestamp,
      pickerLabel: `Role: ${item?.metadata?.name}`,
      pickerValue: `Role:${item?.metadata?.name}`,
    }))
  },
)
