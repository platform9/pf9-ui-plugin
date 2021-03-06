import { createSelector } from 'reselect'
import { pipe, find, prop, filter, map, pluck, mergeLeft } from 'ramda'
import { filterIf } from 'utils/fp'
import getDataSelector from 'core/utils/getDataSelector'
import DataKeys from 'k8s/DataKeys'
import { Tenant } from 'api-client/keystone.model'
import createSorter from 'core/helpers/createSorter'
import { namespacesSelector } from 'k8s/components/namespaces/selectors'

const reservedTenantNames = ['admin', 'services', 'Default', 'heat']
export const filterValidTenants = (tenant) => !reservedTenantNames.includes(tenant.name)
export const filterOutDomains = (tenant) => !!tenant.domain_id

export const tenantsSelector = createSelector(
  [getDataSelector<DataKeys.ManagementTenants>(DataKeys.ManagementTenants), namespacesSelector],
  (allTenantsAllUsers, namespaces) => {
    const heatTenantId = pipe(
      find((tenant: Tenant) => tenant.name === 'heat'),
      prop('id'),
    )(allTenantsAllUsers)
    return pipe<Tenant[], Tenant[], Tenant[]>(
      filter<Tenant>((tenant) => tenant.domain_id !== heatTenantId),
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

export const makeFilteredTenantsSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [tenantsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (tenants, params) => {
      const { includeBlacklisted, orderBy, orderDirection } = params
      return pipe<Tenant[], Tenant[], Tenant[], Tenant[]>(
        filterIf(!includeBlacklisted, filterValidTenants),
        filter(filterOutDomains),
        createSorter({ orderBy, orderDirection }),
      )(tenants)
    },
  )
}
