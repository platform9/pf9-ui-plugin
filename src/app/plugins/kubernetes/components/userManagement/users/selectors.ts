import { createSelector } from 'reselect'
import {
  pathOr,
  pipe,
  find,
  propEq,
  prop,
  filter,
  map,
  pluck,
  omit,
  head,
  innerJoin,
  uniq,
  when,
  isNil,
  always,
  flatten,
  groupBy,
  values,
  reject,
  mergeLeft,
} from 'ramda'
import { emptyArr, emptyObj, upsertAllBy } from 'utils/fp'
import { dataStoreKey, cacheStoreKey } from 'core/caching/cacheReducers'
import createSorter from 'core/helpers/createSorter'
import { TenantWithUsers, Tenant } from 'k8s/components/userManagement/tenants/model'
import { castBoolToStr } from 'utils/misc'
import {
  isSystemUser,
  mngmUsersCacheKey,
  mngmCredentialsCacheKey,
} from 'k8s/components/userManagement/users/actions'
import { tenantsSelector } from 'k8s/components/userManagement/tenants/selectors'
import createParamsFilter from 'core/helpers/createParamsFilter'

const reservedTenantNames = ['admin', 'services', 'Default', 'heat']
export const isValidTenant = (tenant) => !reservedTenantNames.includes(tenant.name)
const adminUserNames = ['heatadmin', 'admin@platform9.net']

export const usersSelector = createSelector<TenantWithUsers[], Namespace[], Tenant[]>([
    pathOr(emptyArr, [cacheStoreKey, dataStoreKey, mngmUsersCacheKey]),
    pathOr(emptyArr, [cacheStoreKey, dataStoreKey, mngmCredentialsCacheKey]),
    tenantsSelector
  ], (users, credentials, allTenants) => {
      const validTenants = filter(isValidTenant, allTenants)

      // Get all tenant users and assign their corresponding tenant ID
      const pluckUsers = map((tenant) =>
        tenant.users.map((user) => ({
          ...user,
          tenantId: tenant.id,
        })),
      )

      // Unify all users with the same ID and group the tenants
      const unifyTenantUsers = map((groupedUsers) => ({
        ...omit(['tenantId'], head(groupedUsers)),
        tenants: innerJoin(
          (tenant, id) => tenant.id === id,
          validTenants,
          uniq(pluck('tenantId', groupedUsers)),
        ),
      }))

      const allUsers = users.map((user) => ({
        id: user.id,
        username: user.name,
        displayname: user.displayname,
        email: user.email,
        defaultProject: user.default_project_id,
        twoFactor: pipe(
          find(propEq('user_id', user.id)),
          when(isNil, always(emptyObj)),
          propEq('type', 'totp'),
          castBoolToStr('enabled', 'disabled'),
        )(credentials),
      }))

      return pipe(
        pluckUsers,
        flatten,
        groupBy(prop('id')),
        values,
        unifyTenantUsers,
        upsertAllBy(prop('id'), allUsers),
      )(validTenants)
    }
)

export const makeFilteredTenantsSelector = (defaultParams = {}) => {
  return createSelector(
    [usersSelector, tenantsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (users, allTenants, params) => {
      const {
        systemUsers,
        orderBy,
        orderDirection
      } = params
      const blacklistedTenants = reject(isValidTenant, allTenants)
      const blacklistedTenantIds = pluck('id', blacklistedTenants)
      const filterUsers = filter((user) => {
        return (
          (systemUsers || !isSystemUser(user)) &&
          user.username &&
          !adminUserNames.includes(user.username) &&
          !blacklistedTenantIds.includes(user.defaultProject)
        )
      })
      return pipe(
        filterUsers,
        createParamsFilter(['tenantId'], params),
        createSorter({ orderBy, orderDirection })
      )(users)
    }
  )
}
