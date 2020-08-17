import { createSelector } from 'reselect'
import { pipe, find, propEq, prop, filter, map, pluck } from 'ramda'
import { filterIf } from 'utils/fp'
import getDataSelector from 'core/utils/getDataSelector'
import DataKeys from 'k8s/DataKeys'

const reservedTenantNames = ['admin', 'services', 'Default', 'heat']
export const filterValidTenants = (tenant) => !reservedTenantNames.includes(tenant.name)

export const tenantsSelector = createSelector(
  [
    getDataSelector(DataKeys.ManagementTenants),
    getDataSelector(DataKeys.Namespaces, ['clusterId']),
  ],
  (allTenantsAllUsers, namespaces) => {
    const heatTenantId = pipe(find(propEq('name', 'heat')), prop('id'))(allTenantsAllUsers)
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
    [tenantsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (clusters, params) => {
      const { includeBlacklisted } = params
      return pipe(filterIf(!includeBlacklisted, filterValidTenants), createSorter())(clusters)
    },
  )
}
