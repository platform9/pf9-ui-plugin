import { createSelector } from 'reselect'
import createSorter from 'core/helpers/createSorter'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { whereEq, pipe, mergeLeft } from 'ramda'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import { findClusterName } from 'k8s/util/helpers'
import { importedClustersSelector } from '../infrastructure/importedClusters/selectors'

// Can be either 'User' or 'Group'
const getSubjectsOfKind = (subjects, kind) =>
  subjects.filter((subject) => subject.kind === kind).map((user) => user.name)

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

export const makeApiGroupsSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [apiGroupsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (items, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(items)
    },
  )
}

export const rolesSelector = createSelector(
  [
    getDataSelector<DataKeys.KubeRoles>(DataKeys.KubeRoles, ['clusterId']),
    clustersSelector,
    importedClustersSelector,
  ],
  (items, clusters, importedClusters) => {
    return items.map((item) => ({
      ...item,
      id: item?.metadata?.uid,
      name: item?.metadata?.name,
      namespace: item?.metadata?.namespace,
      clusterName: findClusterName([...clusters, ...importedClusters], item.clusterId),
      created: item?.metadata?.creationTimestamp,
      pickerLabel: `Role: ${item?.metadata?.name}`,
      pickerValue: `Role:${item?.metadata?.name}`,
    }))
  },
)

export const makeRolesSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [rolesSelector, (_, params) => mergeLeft(params, defaultParams)],
    (items, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(items)
    },
  )
}

export const roleActionsSelector = createSelector(
  [
    getDataSelector<DataKeys.ClusterRoles>(DataKeys.ClusterRoles, ['clusterId']),
    clustersSelector,
    importedClustersSelector,
  ],
  (items, clusters, importedClusters) => {
    return items.map((item) => ({
      ...item,
      id: item?.metadata?.uid,
      name: item?.metadata?.name,
      clusterName: findClusterName([...clusters, ...importedClusters], item.clusterId),
      created: item?.metadata?.creationTimestamp,
      pickerLabel: `Cluster Role: ${item?.metadata?.name}`,
      pickerValue: `ClusterRole:${item?.metadata?.name}`,
    }))
  },
)

export const makeRoleActionsSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [roleActionsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (items, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(items)
    },
  )
}

export const roleBindingsSelector = createSelector(
  // [makeParamsClustersSelector({ healthyClusters: true })], // do you mean to use `makeParamsClustersSelector({ healthyClusters: true })` here?
  [
    getDataSelector<DataKeys.RoleBindings>(DataKeys.RoleBindings, ['clusterId']),
    clustersSelector,
    importedClustersSelector,
  ],
  (items, clusters, importedClusters) => {
    return items.map((item) => ({
      ...item,
      id: item?.metadata?.uid,
      name: item?.metadata?.name,
      namespace: item?.metadata?.namespace,
      clusterName: findClusterName([...clusters, ...importedClusters], item.clusterId),
      created: item?.metadata?.creationTimestamp,
      users: item.subjects ? getSubjectsOfKind(item.subjects, 'User') : [],
      groups: item.subjects ? getSubjectsOfKind(item.subjects, 'Group') : [],
    }))
  },
)

export const makeRoleBindingsSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [roleBindingsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (items, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(items)
    },
  )
}

export const roleBindingActionsSelector = createSelector(
  // [makeParamsClustersSelector({ healthyClusters: true })], // do you mean to use `makeParamsClustersSelector({ healthyClusters: true })` here?
  [
    getDataSelector<DataKeys.ClusterRoleBindings>(DataKeys.ClusterRoleBindings, ['clusterId']),
    clustersSelector,
    importedClustersSelector,
  ],
  (items, clusters, importedClusters) => {
    return items.map((item) => ({
      ...item,
      id: item?.metadata?.uid,
      name: item?.metadata?.name,
      clusterName: findClusterName([...clusters, ...importedClusters], item.clusterId),
      created: item?.metadata?.creationTimestamp,
      users: item.subjects ? getSubjectsOfKind(item.subjects, 'User') : [],
      groups: item.subjects ? getSubjectsOfKind(item.subjects, 'Group') : [],
    }))
  },
)

export const makeRoleBindingActionssSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [roleBindingActionsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (items, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(items)
    },
  )
}
