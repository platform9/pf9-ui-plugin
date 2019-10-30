import ApiClient from 'api-client/ApiClient'
import { pluck, pipe, map, prop, find, propEq, filter } from 'ramda'
import { namespacesCacheKey } from 'k8s/components/namespaces/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { filterIf } from 'utils/fp'

const { keystone } = ApiClient.getInstance()

export const mngmTenantsCacheKey = 'managementTenants'

const reservedTenantNames = ['admin', 'services', 'Default', 'heat']
export const filterValidTenants = tenant => !reservedTenantNames.includes(tenant.name)
export const mngmTenantActions = createCRUDActions(mngmTenantsCacheKey, {
  listFn: async () => keystone.getAllTenantsAllUsers(),
  deleteFn: async ({ id }) => keystone.deleteProject(id),
  createFn: async ({ name, description, users }) => {
    const createdTenant = await keystone.createProject({
      name,
      description,
      enabled: true,
      domain_id: 'default',
      is_domain: false,
    })
    const tenantUsers = await Promise.all(Object.entries(users).map(([userId, roleId]) =>
      keystone.addUserRole({ tenantId: createdTenant.id, userId, roleId }),
    ))
    return {
      ...createdTenant,
      users: tenantUsers,
    }
  },
  dataMapper: async (allTenantsAllUsers, params, loadFromContext) => {
    const namespaces = await loadFromContext(namespacesCacheKey)
    const heatTenantId = pipe(
      find(propEq('name', 'heat')),
      prop('id'),
    )(allTenantsAllUsers)

    return pipe(
      filterIf(!params.includeBlacklisted, filterValidTenants),
      filter(tenant => tenant.domain_id !== heatTenantId),
      map(tenant => ({
        ...tenant,
        users: tenant.users.filter(user => user.username !== 'admin@platform9.net'),
        clusters: pluck('clusterName', namespaces
          .filter(namespace => namespace.metadata.name === tenant.name)),
      })),
    )(allTenantsAllUsers)
  },
})
