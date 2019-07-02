import contextLoader from 'core/helpers/contextLoader'
import {
  path, pluck, pipe, uniq, reduce, map, head, values, groupBy, prop, innerJoin,
} from 'ramda'

export const loadTenants = contextLoader('tenants', async ({ apiClient, loadFromContext }) => {
  const namespaces = await loadFromContext('namespaces')
  const allTenantsAllUsers = await apiClient.keystone.getAllTenantsAllUsers()

  return allTenantsAllUsers.map(tenant => ({
    ...tenant,
    clusters: pluck('clusterName', namespaces
      .filter(namespace => namespace.metadata.name === tenant.name)),
  }))
})

export const deleteTenant = () => {
  console.log('TODO')
}

export const loadUsers = contextLoader('users', async ({ apiClient, loadFromContext }) => {
  const tenants = await loadFromContext('tenants')

  // Get all tenant users and assign the corresponding tenant ID
  const selectAllTenantUsers = reduce((acc, tenant) => {
    const tenantUsers = tenant.users.map(user => ({
      ...user,
      tenantId: tenant.id,
    }))
    return acc.concat(tenantUsers)
  }, [])

  // Unify all users with the same ID
  const unifyUsers = map(groupedUsers => ({
    ...head(groupedUsers),
    two_factor: path(['mfa', 'enabled'], head(groupedUsers)) ? 'enabled' : 'disabled',
    // Get user tenant names and concat them with commas
    tenants: innerJoin(
      (tenant, id) => tenant.id === id,
      tenants,
      uniq(pluck('tenantId', groupedUsers)),
    ).map(prop('name')).join(', '),
  }))

  return pipe(
    selectAllTenantUsers,
    groupBy(prop('id')),
    values,
    unifyUsers,
  )(tenants)
})

export const deleteUser = () => {
  console.log('TODO')
}
