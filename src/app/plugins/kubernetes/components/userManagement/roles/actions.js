
import createCRUDActions from 'core/helpers/createCRUDActions'
import { pipe, map } from 'ramda'
import { filterIf } from 'utils/fp'

export const mngmRolesCacheKey = 'managementRoles'
export const mngmRoleActions = createCRUDActions(mngmRolesCacheKey, {
  listFn: async () => {
    return getKubernetesRoles()
  },
  dataMapper: (roles, params) => pipe(
    filterIf(!params.allRoles, role => ['admin', '_member_'].includes(role.name)),
    map(role => ({
      ...role,
      name: role.displayName || role.name,
    })),
  )(roles),
  defaultOrderBy: 'name',
})

function getKubernetesRoles () {
  return Promise.resolve(hardcodedKubeRoles)
}

// Generally not a fan of this, but we dont have a lot of options.
// Need the backend to wrap a service around keystone.getRoles to accept a platform / target
// Once supported pass a platform though. Where platform is either 'kubernetes' | 'openstack'
const hardcodedKubeRoles = [
  {
    displayName: 'Administrator',
    description: 'An Administrator has global access to all regions, tenants and all resources within your Platform9 environment, and access to perform all operations. As a Platform9 Managed Kubernetes (PMK) administrator you can invite more users to your PMK cloud environment, create or delete tenants, create or delete clusters, deploy workloads on clusters, assign RBAC policies to self-service users so they can access clusters,  etc.',
    id: '5a5ef4913684433495889bc991ba2e4e',
    name: 'admin',
  },
  {
    displayName: 'Self-Service User',
    description: 'A self-service user has limited access to the Platform9 Managed Kubernetes (PMK) cloud environment. When an Administrator invites a self-service user to the PMK cloud environment, they can start by assigning the user to one or more tenants. The user will only be able to log into those tenants. Within the tenant, a self-service user will by default not have access to any clusters created in that tenant. The administrator will need to create specific RBAC policies to give the user access to one or more clusters within the tenant, before the users can perform any operations on the clusters.',
    id: '9fe2ff9ee4384b1894a90878d3e92bab',
    name: '_member_',
  },
]
