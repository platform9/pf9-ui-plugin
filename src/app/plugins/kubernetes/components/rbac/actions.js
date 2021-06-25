import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
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
import { trackEvent } from 'utils/tracking'

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
    Bugsnag.leaveBreadcrumb('Attempting to load core API resources', { clusterId })
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
    Bugsnag.leaveBreadcrumb('Attempting to load API resources', { clusterId, apiGroup })
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
    Bugsnag.leaveBreadcrumb('Attempting to load API groups', { clusterId })
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
    Bugsnag.leaveBreadcrumb('Attempting to get kube roles', { clusterId })
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
    Bugsnag.leaveBreadcrumb('Attempting to create kube role', body)
    trackEvent('Create Kube Role', body)
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
    Bugsnag.leaveBreadcrumb('Attempting to update kube role', body)
    trackEvent('Update Kube Role', body)
    return qbert.updateClusterRole(data.clusterId, data.namespace, data.name, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete kube role', { id })
    const { qbert } = ApiClient.getInstance()
    const item = currentItems.find(propEq('id', id))
    if (!item) {
      throw new Error(`Unable to find role with id: ${id}`)
    }
    const { clusterId, namespace, name } = item
    await qbert.deleteClusterRole(clusterId, namespace, name)
    trackEvent('Delete Kube Role', { id })
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
    Bugsnag.leaveBreadcrumb('Attempting to get cluster roles', { clusterId })
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterClusterRoles)).then(flatten)
    }
    return qbert.getClusterClusterRoles(clusterId)
  },
  createFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to create cluster role', {
      clusterId: data.clusterId,
      name: data.name,
    })
    const rules = rbacApiGroupsToRules(data.rbac)
    const body = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRole',
      metadata: {
        name: data.name,
      },
      rules,
    }
    trackEvent('Create Cluster Role', { clusterId: data.clusterId, name: data.name })
    return qbert.createClusterClusterRole(data.clusterId, body)
  },
  updateFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to update cluster role', {
      clusterId: data.clusterId,
      name: data.name,
    })
    const rules = rbacApiGroupsToRules(data.rbac)
    const body = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRole',
      metadata: {
        name: data.name,
      },
      rules,
    }
    trackEvent('Update Cluster Role', { clusterId: data.clusterId, name: data.name })
    return qbert.updateClusterClusterRole(data.clusterId, data.name, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    const { qbert } = ApiClient.getInstance()
    const item = currentItems.find(propEq('id', id))
    if (!item) {
      throw new Error(`Unable to find cluster role with id: ${id}`)
    }
    const { clusterId, name } = item
    Bugsnag.leaveBreadcrumb('Attempting to delete cluster role', { id, clusterId, name })
    trackEvent('Delete Cluster Role', { id, clusterId, name })
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
    Bugsnag.leaveBreadcrumb('Attempting to get role bindings', { clusterId })
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterRoleBindings)).then(flatten)
    }
    return qbert.getClusterRoleBindings(clusterId)
  },
  createFn: async (data) => {
    const { clusterId, namespace, name } = data
    Bugsnag.leaveBreadcrumb('Attempting to create role binding', { clusterId, namespace, name })
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
    trackEvent('Create Role Binding', { clusterId, namespace, name })
    return qbert.createClusterRoleBinding(data.clusterId, data.namespace, body)
  },
  updateFn: async (data) => {
    const { clusterId, namespace, name } = data
    Bugsnag.leaveBreadcrumb('Attempting to update role binding', { clusterId, namespace, name })
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
    trackEvent('Update Role Binding', { clusterId, namespace, name })
    return qbert.updateClusterRoleBinding(data.clusterId, data.namespace, data.name, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    const { qbert } = ApiClient.getInstance()
    const item = currentItems.find(propEq('id', id))
    if (!item) {
      throw new Error(`Unable to find role binding with id: ${id}`)
    }
    const { clusterId, namespace, name } = item
    Bugsnag.leaveBreadcrumb('Attempting to delete role binding', { clusterId, namespace, name, id })
    await qbert.deleteClusterRoleBinding(clusterId, namespace, name)
    trackEvent('Delete Role Binding', { clusterId, namespace, name, id })
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
    Bugsnag.leaveBreadcrumb('Attempting to get cluster role bindings', { clusterId })
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterClusterRoleBindings)).then(
        flatten,
      )
    }
    return qbert.getClusterClusterRoleBindings(clusterId)
  },
  createFn: async (data) => {
    const { clusterId, name } = data
    Bugsnag.leaveBreadcrumb('Attempting to create cluster role binding', { clusterId, name })
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
    trackEvent('Create Cluster Role Binding', { clusterId, name })
    return qbert.createClusterClusterRoleBinding(data.clusterId, body)
  },
  updateFn: async (data) => {
    const { clusterId, name } = data
    Bugsnag.leaveBreadcrumb('Attempting to update cluster role binding', { clusterId, name })
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
    trackEvent('Update Cluster Role Binding', { clusterId, name })
    return qbert.updateClusterClusterRoleBinding(data.clusterId, data.name, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete cluster role binding', { id })
    const { qbert } = ApiClient.getInstance()
    const item = currentItems.find(propEq('id', id))
    if (!item) {
      throw new Error(`Unable to find cluster role binding with id: ${id}`)
    }
    const { clusterId, name } = item
    await qbert.deleteClusterClusterRoleBinding(clusterId, name)
    trackEvent('Delete Cluster Role Binding', { id })
  },
  uniqueIdentifier,
  entityName: 'Cluster Role Binding',
  indexBy: 'clusterId',
  selectorCreator: makeRoleBindingActionssSelector,
})

export const rbacProfileActions = createCRUDActions(ActionDataKeys.RbacProfiles, {
  createFn: async (data) => {
    const roles = Object.values(data.roles).map(
      ({ name, namespace }) => `${namespace}/roles/${name}`,
    )
    const roleBindings = Object.values(data.roleBindings).map(
      ({ name, namespace }) => `${namespace}/rolebindings/${name}`,
    )
    const clusterRoles = Object.values(data.clusterRoles).map(({ name }) => `clusterroles/${name}`)
    const clusterRoleBindings = Object.values(data.clusterRoleBindings).map(
      ({ name }) => `clusterrolebindings/${name}`,
    )
    const body = {
      apiVersion: 'sunpike.platform9.com/v1alpha2',
      kind: 'ClusterProfile',
      metadata: { name: data.profileName },
      spec: {
        cloneFrom: data.baseCluster,
        namespaceScopedResources: [...roles, ...roleBindings],
        clusterScopedResources: [...clusterRoles, ...clusterRoleBindings],
        reapInterval: 30,
      },
    }
    Bugsnag.leaveBreadcrumb('Attempting to create a rbac profile', body)
    await qbert.createRbacProfile(body)
    trackEvent('Create Rbac Profile', body)
  },
  uniqueIdentifier,
  entityName: 'RBAC Profiles',
  indexBy: 'clusterId',
})
