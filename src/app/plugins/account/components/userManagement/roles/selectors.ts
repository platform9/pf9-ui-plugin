import { createSelector } from 'reselect'
import { mergeLeft, pipe } from 'ramda'
import { filterIf } from 'utils/fp'
import createSorter from 'core/helpers/createSorter'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { IRolesSelector } from './model'

export const managementRolesSelector = createSelector(
  [getDataSelector<DataKeys.ManagementRoles>(DataKeys.ManagementRoles)],
  (rawRoles) => {
    // associate nodes with the combinedHost entry
    return rawRoles.map((role) => ({
      ...role,
      displayName:
        role.displayName || ['admin', '_member_'].includes(role.name)
          ? hardcodedKubeRolesNames[role.name]
          : role.name,
      description: ['admin', '_member_'].includes(role.name)
        ? hardcodedKubeRolesDescriptions[role.name]
        : role.description,
    }))
  },
)

export const makeManagementRolesSelector = (
  defaultParams = {
    orderBy: 'name',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [managementRolesSelector, (_, params) => mergeLeft(params, defaultParams)],
    (roles, params) => {
      const { allRoles, orderBy, orderDirection } = params
      return pipe<IRolesSelector[], IRolesSelector[], IRolesSelector[]>(
        filterIf(!allRoles, (role) => ['admin', '_member_'].includes(role.name)),
        createSorter({ orderBy, orderDirection }),
      )(roles)
    },
  )
}

// Generally not a fan of this, but we dont have a lot of options.
// Need the backend to wrap a service around keystone.getRoles to accept a platform / target
// Once supported pass a platform though. Where platform is either 'kubernetes' | 'openstack'
const hardcodedKubeRolesDescriptions = {
  admin:
    'An Administrator has global access to all regions, tenants and all resources within your Platform9 environment, and access to perform all operations. As a Platform9 Managed Kubernetes (PMK) administrator you can invite more users to your PMK cloud environment, create or delete tenants, create or delete clusters, deploy workloads on clusters, assign RBAC policies to self-service users so they can access clusters,  etc.',
  _member_:
    'A self-service user has limited access to the Platform9 Managed Kubernetes (PMK) cloud environment. When an Administrator invites a self-service user to the PMK cloud environment, they can start by assigning the user to one or more tenants. The user will only be able to log into those tenants. Within the tenant, a self-service user will by default not have access to any clusters created in that tenant. The administrator will need to create specific RBAC policies to give the user access to one or more clusters within the tenant, before the users can perform any operations on the clusters.',
}

const hardcodedKubeRolesNames = {
  admin: 'Administrator',
  _member_: 'Self-service User',
}
