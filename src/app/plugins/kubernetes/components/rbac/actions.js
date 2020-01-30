import createCRUDActions from 'core/helpers/createCRUDActions'
import ApiClient from 'api-client/ApiClient'
import { propEq, pluck, pipe, find, prop, flatten } from 'ramda'
import { mapAsync, someAsync } from 'utils/async'
import { clustersCacheKey } from '../infrastructure/common/actions'
import createContextLoader from 'core/helpers/createContextLoader'
import { pathStr } from 'utils/fp'
import { allKey } from 'app/constants'

const { qbert } = ApiClient.getInstance()

const uniqueIdentifier = 'metadata.uid'

const rbacApiGroupsToRules = (apiGroups) => {
  const rules = []
  Object.keys(apiGroups).map((apiGroupName) => {
    Object.keys(apiGroups[apiGroupName]).map((resourceName) => {
      const rule = {
        apiGroups: apiGroupName === 'core' ? [''] : [apiGroupName],
        resources: [resourceName],
        verbs: Object.keys(apiGroups[apiGroupName][resourceName])
      }
      rules.push(rule)
    })
  })
  return rules
}

// Can be either 'User' or 'Group'
const getSubjectsOfKind = (subjects, kind) => (
  subjects.filter(subject => subject.kind === kind).map(user => user.name)
)

createContextLoader('coreApiResources', async ({ clusterId }) => {
  const response = await qbert.getCoreApiResourcesList(clusterId)
  const apiResources = response.resources.map((item) => {
    return {
      ...item,
      id: `${item.name}-${clusterId}`
    }
  })
  return apiResources
}, {
  indexBy: 'clusterId',
  uniqueIdentifier: 'id',
})

createContextLoader('apiResources', async ({ clusterId, apiGroup }) => {
  const response = await qbert.getApiResourcesList({ clusterId, apiGroup })
  const apiResources = response.resources.map((item) => {
    item.id = `${item.name}-${clusterId}`
    return item
  })
  return apiResources
}, {
  indexBy: ['clusterId', 'apiGroup'],
  uniqueIdentifier: 'id',
})

const clusterApiGroupsCacheKey = 'apiGroups'
export const apiGroupsLoader = createContextLoader(clusterApiGroupsCacheKey, async ({ clusterId }) => {
  const response = await qbert.getApiGroupList(clusterId)
  const apiGroups = response.groups.map((item) => {
    item.id = `${item.name}-${clusterId}`
    return item
  })
  return apiGroups
}, {
  dataMapper: async (apiGroups, { clusterId }, loadFromContext) => {
    const coreResourcesResponse = await loadFromContext('coreApiResources', { clusterId })
    const coreApiGroupWithResources = {
      name: 'core',
      groupVersion: 'core',
      resources: coreResourcesResponse,
    }
    const apiGroupsWithResources = await mapAsync(async apiGroup => {
      const groupVersion = apiGroup.preferredVersion.groupVersion
      const resources = await loadFromContext('apiResources', {
        clusterId,
        apiGroup: groupVersion,
      })
      return {
        name: apiGroup.name,
        resources,
        groupVersion
      }
    }, apiGroups)
    return [coreApiGroupWithResources, ...apiGroupsWithResources]
  },
  defaultOrderBy: 'groupName',
  defaultOrderDirection: 'asc',
  uniqueIdentifier: 'id',
  indexBy: 'clusterId',
})

export const rolesCacheKey = 'kubeRoles'
export const roleActions = createCRUDActions(rolesCacheKey, {
  listFn: async (params, loadFromContext) => {
    const { clusterId } = params
    const clusters = await loadFromContext(clustersCacheKey, { healthyClusters: true })
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterRoles)).then(flatten)
    }
    return qbert.getClusterRoles(clusterId)
  },
  createFn: async data => {
    const rules = rbacApiGroupsToRules(data.rbac)
    const body = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'Role',
      metadata: {
        name: data.name,
        namespace: data.namespace
      },
      rules,
    }
    return qbert.createClusterRole(data.clusterId, data.namespace, body)
  },
  updateFn: async data => {
    const rules = rbacApiGroupsToRules(data.rbac)
    const body = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'Role',
      metadata: {
        name: data.name
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
  dataMapper: async (items, params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey, { healthyClusters: true })
    return items.map(item => ({
      ...item,
      id: pathStr('metadata.uid', item),
      name: pathStr('metadata.name', item),
      namespace: pathStr('metadata.namespace', item),
      clusterName: pipe(find(propEq('uuid', item.clusterId)), prop('name'))(clusters),
      created: pathStr('metadata.creationTimestamp', item),
      pickerLabel: `Role: ${item.metadata.name}`,
      pickerValue: `Role:${item.metadata.name}`,
    }))
  },
  uniqueIdentifier,
  entityName: 'Role',
  indexBy: 'clusterId',
})

export const clusterRolesCacheKey = 'clusterRoles'
export const clusterRoleActions = createCRUDActions(clusterRolesCacheKey, {
  listFn: async (params, loadFromContext) => {
    const { clusterId } = params
    const clusters = await loadFromContext(clustersCacheKey, { healthyClusters: true })
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterClusterRoles)).then(flatten)
    }
    return qbert.getClusterClusterRoles(clusterId)
  },
  createFn: async data => {
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
  updateFn: async data => {
    const rules = rbacApiGroupsToRules(data.rbac)
    const body = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRole',
      metadata: {
        name: data.name
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
  dataMapper: async (items, params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey, { healthyClusters: true })
    return items.map(item => ({
      ...item,
      id: pathStr('metadata.uid', item),
      name: pathStr('metadata.name', item),
      clusterName: pipe(find(propEq('uuid', item.clusterId)), prop('name'))(clusters),
      created: pathStr('metadata.creationTimestamp', item),
      pickerLabel: `Cluster Role: ${item.metadata.name}`,
      pickerValue: `ClusterRole:${item.metadata.name}`
    }))
  },
  uniqueIdentifier,
  entityName: 'Cluster Role',
  indexBy: 'clusterId',
})

export const roleBindingsCacheKey = 'roleBindings'
export const roleBindingActions = createCRUDActions(roleBindingsCacheKey, {
  listFn: async (params, loadFromContext) => {
    const { clusterId } = params
    const clusters = await loadFromContext(clustersCacheKey, { healthyClusters: true })
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterRoleBindings)).then(flatten)
    }
    return qbert.getClusterRoleBindings(clusterId)
  },
  createFn: async data => {
    const users = data.users.map((user) => (
      {
        kind: 'User',
        name: user,
        apiGroup: 'rbac.authorization.k8s.io'
      }
    ))

    const groups = data.groups.map((group) => (
      {
        kind: 'Group',
        name: group,
        apiGroup: 'rbac.authorization.k8s.io'
      }
    ))

    const subjects = [...users, ...groups]

    const [roleType, ...rest] = data.role.split(':')
    const roleName = rest.join(':')
    const body = {
      kind: 'RoleBinding',
      metadata: {
        name: data.name,
        namespace: data.namespace
      },
      subjects,
      roleRef: {
        kind: roleType,
        name: roleName,
        apiGroup: 'rbac.authorization.k8s.io'
      }
    }

    return qbert.createClusterRoleBinding(data.clusterId, data.namespace, body)
  },
  updateFn: async data => {
    const users = data.users.map((user) => (
      {
        kind: 'User',
        name: user,
        apiGroup: 'rbac.authorization.k8s.io'
      }
    ))

    const groups = data.groups.map((group) => (
      {
        kind: 'Group',
        name: group,
        apiGroup: 'rbac.authorization.k8s.io'
      }
    ))

    const subjects = [...users, ...groups]

    const body = {
      kind: 'RoleBinding',
      metadata: {
        name: data.name,
      },
      subjects,
      roleRef: data.roleRef
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
  dataMapper: async (items, params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey, { healthyClusters: true })
    return items.map(item => ({
      ...item,
      id: pathStr('metadata.uid', item),
      name: pathStr('metadata.name', item),
      namespace: pathStr('metadata.namespace', item),
      clusterName: pipe(find(propEq('uuid', item.clusterId)), prop('name'))(clusters),
      created: pathStr('metadata.creationTimestamp', item),
      users: item.subjects ? getSubjectsOfKind(item.subjects, 'User') : [],
      groups: item.subjects ? getSubjectsOfKind(item.subjects, 'Group') : [],
    }))
  },
  uniqueIdentifier,
  entityName: 'Role Binding',
  indexBy: 'clusterId',
})

export const clusterRoleBindingsCacheKey = 'clusterRoleBindings'
export const clusterRoleBindingActions = createCRUDActions(clusterRoleBindingsCacheKey, {
  listFn: async (params, loadFromContext) => {
    const { clusterId } = params
    const clusters = await loadFromContext(clustersCacheKey, { healthyClusters: true })
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterClusterRoleBindings)).then(flatten)
    }
    return qbert.getClusterClusterRoleBindings(clusterId)
  },
  createFn: async data => {
    const users = data.users.map((user) => (
      {
        kind: 'User',
        name: user,
        apiGroup: 'rbac.authorization.k8s.io'
      }
    ))

    const groups = data.groups.map((group) => (
      {
        kind: 'Group',
        name: group,
        apiGroup: 'rbac.authorization.k8s.io'
      }
    ))

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
        apiGroup: 'rbac.authorization.k8s.io'
      }
    }

    return qbert.createClusterClusterRoleBinding(data.clusterId, body)
  },
  updateFn: async data => {
    const users = data.users.map((user) => (
      {
        kind: 'User',
        name: user,
        apiGroup: 'rbac.authorization.k8s.io'
      }
    ))

    const groups = data.groups.map((group) => (
      {
        kind: 'Group',
        name: group,
        apiGroup: 'rbac.authorization.k8s.io'
      }
    ))

    const subjects = [...users, ...groups]

    const body = {
      kind: 'ClusterRoleBinding',
      metadata: {
        name: data.name,
      },
      subjects,
      roleRef: data.roleRef
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
  dataMapper: async (items, params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey, { healthyClusters: true })
    return items.map(item => ({
      ...item,
      id: pathStr('metadata.uid', item),
      name: pathStr('metadata.name', item),
      clusterName: pipe(find(propEq('uuid', item.clusterId)), prop('name'))(clusters),
      created: pathStr('metadata.creationTimestamp', item),
      users: item.subjects ? getSubjectsOfKind(item.subjects, 'User') : [],
      groups: item.subjects ? getSubjectsOfKind(item.subjects, 'Group') : [],
    }))
  },
  uniqueIdentifier,
  entityName: 'Cluster Role Binding',
  indexBy: 'clusterId',
})
