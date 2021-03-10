import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { clusterActions, parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import {
  apiGroupsSelector,
  makeApiGroupsSelector,
  makeRoleActionsSelector,
  makeRoleBindingActionssSelector,
  makeRoleBindingsSelector,
  makeRolesSelector,
} from 'k8s/components/rbac/selectors'
import { ActionDataKeys } from 'k8s/DataKeys'
import { flatten, pluck, propEq, uniq } from 'ramda'
import { someAsync } from 'utils/async'

const { qbert } = ApiClient.getInstance()

const uniqueIdentifier = 'metadata.uid'

const rbacApiGroupsToRules = (apiGroups) => {
  const rules = []
  Object.keys(apiGroups).map((apiGroupName) => {
    Object.keys(apiGroups[apiGroupName]).map((resourceName) => {
      const rule = {
        apiGroups: apiGroupName === 'core' ? [''] : [apiGroupName],
        resources: [resourceName],
        verbs: Object.keys(apiGroups[apiGroupName][resourceName]),
      }
      rules.push(rule)
    })
  })
  return rules
}

const loadCoreApiResources = createContextLoader(
  ActionDataKeys.CoreApiResources,
  async ({ clusterId }) => {
    const response = await qbert.getCoreApiResourcesList(clusterId)
    return response.resources
  },
  {
    indexBy: 'clusterId',
    uniqueIdentifier: ['name', 'clusterId'],
  },
)

const loadApiResources = createContextLoader(
  ActionDataKeys.ApiResources,
  async ({ clusterId, apiGroup }) => {
    try {
      const response = await qbert.getApiResourcesList({ clusterId, apiGroup })
      return response.resources
    } catch (err) {
      console.log(err, 'error')
      return []
    }
  },
  {
    indexBy: ['clusterId', 'apiGroup'],
    uniqueIdentifier: ['name', 'clusterId'],
  },
)

export const apiGroupsLoader = createContextLoader(
  ActionDataKeys.ApiGroups,
  async ({ clusterId }) => {
    const response = await qbert.getApiGroupList(clusterId)
    const apiGroups = response.groups
    const groupVersions = uniq(apiGroups.map((apiGroup) => apiGroup.preferredVersion.groupVersion))
    await Promise.all([
      loadCoreApiResources({ clusterId }),
      ...groupVersions.map((apiGroup) => loadApiResources({ clusterId, apiGroup })),
    ])
    return apiGroups
  },
  {
    defaultOrderBy: 'groupName',
    defaultOrderDirection: 'asc',
    uniqueIdentifier: ['name', 'clusterId'],
    indexBy: 'clusterId',
    selector: apiGroupsSelector,
    selectorCreator: makeApiGroupsSelector,
  },
)

export const roleActions = createCRUDActions(ActionDataKeys.KubeRoles, {
  listFn: async (params) => {
    // const { clusterId } = params
    // const clusters = await clusterActions.list({ healthyClusters: true })
    const [clusterId, clusters] = await parseClusterParams({ ...params, healthyClusters: true })
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterRoles)).then(flatten)
    }
    return qbert.getClusterRoles(clusterId)
  },
  createFn: async (data) => {
    const rules = rbacApiGroupsToRules(data.rbac)
    const body = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'Role',
      metadata: {
        name: data.name,
        namespace: data.namespace,
      },
      rules,
    }
    return qbert.createClusterRole(data.clusterId, data.namespace, body)
  },
  updateFn: async (data) => {
    const rules = rbacApiGroupsToRules(data.rbac)
    const body = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'Role',
      metadata: {
        name: data.name,
      },
      rules,
    }
    return qbert.updateClusterRole(data.clusterId, data.namespace, data.name, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    const { qbert } = ApiClient.getInstance()
    const item = currentItems.find(propEq('id', id))
    if (!item) {
      throw new Error(`Unable to find role with id: ${id}`)
    }
    const { clusterId, namespace, name } = item
    await qbert.deleteClusterRole(clusterId, namespace, name)
  },
  uniqueIdentifier,
  entityName: 'Role',
  indexBy: 'clusterId',
  selectorCreator: makeRolesSelector,
})

export const clusterRoleActions = createCRUDActions(ActionDataKeys.ClusterRoles, {
  listFn: async (params) => {
    // const { clusterId } = params
    // const clusters = await clusterActions.list({ healthyClusters: true })
    const [clusterId, clusters] = await parseClusterParams({ ...params, healthyClusters: true })
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterClusterRoles)).then(flatten)
    }
    return qbert.getClusterClusterRoles(clusterId)
  },
  createFn: async (data) => {
    const rules = rbacApiGroupsToRules(data.rbac)
    const body = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRole',
      metadata: {
        name: data.name,
      },
      rules,
    }
    return qbert.createClusterClusterRole(data.clusterId, body)
  },
  updateFn: async (data) => {
    const rules = rbacApiGroupsToRules(data.rbac)
    const body = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRole',
      metadata: {
        name: data.name,
      },
      rules,
    }
    return qbert.updateClusterClusterRole(data.clusterId, data.name, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    const { qbert } = ApiClient.getInstance()
    const item = currentItems.find(propEq('id', id))
    if (!item) {
      throw new Error(`Unable to find cluster role with id: ${id}`)
    }
    const { clusterId, name } = item
    await qbert.deleteClusterClusterRole(clusterId, name)
  },
  uniqueIdentifier,
  entityName: 'Cluster Role',
  indexBy: 'clusterId',
  selectorCreator: makeRoleActionsSelector,
})

export const roleBindingActions = createCRUDActions(ActionDataKeys.RoleBindings, {
  listFn: async (params) => {
    // const { clusterId } = params
    // const clusters = await clusterActions.list({ healthyClusters: true })
    const [clusterId, clusters] = await parseClusterParams({ ...params, healthyClusters: true })
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterRoleBindings)).then(flatten)
    }
    return qbert.getClusterRoleBindings(clusterId)
  },
  createFn: async (data) => {
    const users = data.users.map((user) => ({
      kind: 'User',
      name: user,
      apiGroup: 'rbac.authorization.k8s.io',
    }))

    const groups = data.groups.map((group) => ({
      kind: 'Group',
      name: group,
      apiGroup: 'rbac.authorization.k8s.io',
    }))

    const subjects = [...users, ...groups]

    const [roleType, ...rest] = data.role.split(':')
    const roleName = rest.join(':')
    const body = {
      kind: 'RoleBinding',
      metadata: {
        name: data.name,
        namespace: data.namespace,
      },
      subjects,
      roleRef: {
        kind: roleType,
        name: roleName,
        apiGroup: 'rbac.authorization.k8s.io',
      },
    }

    return qbert.createClusterRoleBinding(data.clusterId, data.namespace, body)
  },
  updateFn: async (data) => {
    const users = data.users.map((user) => ({
      kind: 'User',
      name: user,
      apiGroup: 'rbac.authorization.k8s.io',
    }))

    const groups = data.groups.map((group) => ({
      kind: 'Group',
      name: group,
      apiGroup: 'rbac.authorization.k8s.io',
    }))

    const subjects = [...users, ...groups]

    const body = {
      kind: 'RoleBinding',
      metadata: {
        name: data.name,
      },
      subjects,
      roleRef: data.roleRef,
    }
    return qbert.updateClusterRoleBinding(data.clusterId, data.namespace, data.name, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    const { qbert } = ApiClient.getInstance()
    const item = currentItems.find(propEq('id', id))
    if (!item) {
      throw new Error(`Unable to find role binding with id: ${id}`)
    }
    const { clusterId, namespace, name } = item
    await qbert.deleteClusterRoleBinding(clusterId, namespace, name)
  },
  uniqueIdentifier,
  entityName: 'Role Binding',
  indexBy: 'clusterId',
  selectorCreator: makeRoleBindingsSelector,
})

export const clusterRoleBindingActions = createCRUDActions(ActionDataKeys.ClusterRoleBindings, {
  listFn: async (params) => {
    // const { clusterId } = params
    // const clusters = await clusterActions.list({ healthyClusters: true })
    const [clusterId, clusters] = await parseClusterParams({ ...params, healthyClusters: true })
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterClusterRoleBindings)).then(
        flatten,
      )
    }
    return qbert.getClusterClusterRoleBindings(clusterId)
  },
  createFn: async (data) => {
    const users = data.users.map((user) => ({
      kind: 'User',
      name: user,
      apiGroup: 'rbac.authorization.k8s.io',
    }))

    const groups = data.groups.map((group) => ({
      kind: 'Group',
      name: group,
      apiGroup: 'rbac.authorization.k8s.io',
    }))

    const subjects = [...users, ...groups]

    const [roleType, ...rest] = data.clusterRole.split(':')
    const roleName = rest.join(':')
    const body = {
      kind: 'ClusterRoleBinding',
      metadata: {
        name: data.name,
      },
      subjects,
      roleRef: {
        kind: roleType,
        name: roleName,
        apiGroup: 'rbac.authorization.k8s.io',
      },
    }

    return qbert.createClusterClusterRoleBinding(data.clusterId, body)
  },
  updateFn: async (data) => {
    const users = data.users.map((user) => ({
      kind: 'User',
      name: user,
      apiGroup: 'rbac.authorization.k8s.io',
    }))

    const groups = data.groups.map((group) => ({
      kind: 'Group',
      name: group,
      apiGroup: 'rbac.authorization.k8s.io',
    }))

    const subjects = [...users, ...groups]

    const body = {
      kind: 'ClusterRoleBinding',
      metadata: {
        name: data.name,
      },
      subjects,
      roleRef: data.roleRef,
    }
    return qbert.updateClusterClusterRoleBinding(data.clusterId, data.name, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    const { qbert } = ApiClient.getInstance()
    const item = currentItems.find(propEq('id', id))
    if (!item) {
      throw new Error(`Unable to find cluster role binding with id: ${id}`)
    }
    const { clusterId, name } = item
    await qbert.deleteClusterClusterRoleBinding(clusterId, name)
  },
  uniqueIdentifier,
  entityName: 'Cluster Role Binding',
  indexBy: 'clusterId',
  selectorCreator: makeRoleBindingActionssSelector,
})
