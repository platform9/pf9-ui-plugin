import { createSelector } from 'reselect'
import { pathOr, pipe, find, propEq, prop, filter, map, pluck } from 'ramda'
import { emptyArr, filterIf } from 'utils/fp'
import { dataStoreKey, cacheStoreKey } from 'core/caching/cacheReducers'
import createSorter from 'core/helpers/createSorter'
import { namespacesCacheKey } from 'k8s/components/namespaces/actions'
import { TenantWithUsers, Tenant } from 'k8s/components/userManagement/tenants/model'
import { mngmTenantsCacheKey } from 'k8s/components/userManagement/tenants/actions'
import { Namespace } from 'k8s/components/namespaces/model'
import getParamsFilter from 'core/helpers/getParamsFilter'

const reservedTenantNames = ['admin', 'services', 'Default', 'heat']
export const filterValidTenants = (tenant) => !reservedTenantNames.includes(tenant.name)

export const tenantsSelector = createSelector<TenantWithUsers[], Namespace[], Tenant[]>([
    pathOr(emptyArr, [cacheStoreKey, dataStoreKey, mngmTenantsCacheKey]),
    pathOr(emptyArr, [cacheStoreKey, dataStoreKey, namespacesCacheKey])
  ],
  (allTenantsAllUsers, namespaces) => {
    const heatTenantId = pipe(
      find(propEq('name', 'heat')),
      prop('id')
    )(allTenantsAllUsers)
    return pipe(
      filter((tenant) => tenant.domain_id !== heatTenantId),
      map((tenant) => ({
        ...tenant,
        users: tenant.users.filter((user) => user.username !== 'admin@platform9.net'),
        clusters: pluck(
          'clusterName',
          namespaces.filter((namespace) => namespace.metadata.name === tenant.name),
        ),
      })),
    )(allTenantsAllUsers)
  },
)

export const makeFilteredTenantsSelector = () => {
  return createSelector(
    [tenantsSelector, getParamsFilter()],
    (clusters, params) => {
      const {
        includeBlacklisted
      } = params
      return pipe(
        filterIf(!includeBlacklisted, filterValidTenants),
        createSorter()
      )(clusters)
    }
  )
}
