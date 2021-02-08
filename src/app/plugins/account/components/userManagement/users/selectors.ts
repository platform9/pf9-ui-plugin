import { createSelector } from 'reselect'
import {
  always,
  filter,
  find,
  flatten,
  groupBy,
  head,
  innerJoin,
  isNil,
  map,
  mergeLeft,
  omit,
  pipe,
  pluck,
  prop,
  propEq,
  reject,
  uniq,
  values,
  when,
} from 'ramda'
import { emptyObj, upsertAllBy } from 'utils/fp'
import createSorter from 'core/helpers/createSorter'
import { castBoolToStr } from 'utils/misc'
import { tenantsSelector } from 'account/components/userManagement/tenants/selectors'
import getDataSelector from 'core/utils/getDataSelector'
import DataKeys from 'k8s/DataKeys'
import { Tenant, TenantUser } from 'api-client/keystone.model'
import { IUsersSelector } from './model'
import { isSystemUser } from './helpers'

const reservedTenantNames = ['admin', 'services', 'Default', 'heat']
export const isValidTenant = (tenant) => !reservedTenantNames.includes(tenant.name)
const adminUserNames = ['heatadmin', 'admin@platform9.net']

interface PluckedTenantUsers extends TenantUser {
  tenantId: string
}
type UnifiedTenantUsers = Omit<TenantUser, 'tenantId'> & { tenants: Tenant[] }

export const usersSelector = createSelector(
  [
    getDataSelector<DataKeys.ManagementUsers>(DataKeys.ManagementUsers),
    getDataSelector<DataKeys.ManagementCredentials>(DataKeys.ManagementCredentials),
    tenantsSelector,
  ],
  (rawUsers, credentials, allTenants) => {
    const validTenants = filter<Tenant>(isValidTenant, allTenants)

    // Get all tenant users and assign their corresponding tenant ID
    const pluckUsers = map<Tenant, PluckedTenantUsers[]>((tenant) =>
      tenant.users.map((user) => ({
        ...user,
        tenantId: tenant.id,
      })),
    )

    // Unify all users with the same ID and group the tenants
    const unifyTenantUsers = map<PluckedTenantUsers[], UnifiedTenantUsers>(
      (groupedUsers: PluckedTenantUsers[]) => ({
        ...omit<PluckedTenantUsers, 'tenantId'>(['tenantId'], head(groupedUsers)),
        tenants: innerJoin(
          (tenant, id) => tenant.id === id,
          validTenants,
          uniq(pluck<'tenantId', PluckedTenantUsers>('tenantId', groupedUsers)),
        ),
      }),
    )

    const allUsers = rawUsers.map((user) => ({
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

    return pipe<
      Tenant[],
      PluckedTenantUsers[][],
      PluckedTenantUsers[],
      {
        [index: string]: PluckedTenantUsers[]
      },
      PluckedTenantUsers[][],
      UnifiedTenantUsers[],
      IUsersSelector[]
    >(
      pluckUsers,
      flatten,
      groupBy(prop('id')),
      values,
      unifyTenantUsers,
      upsertAllBy(prop('id'), allUsers),
    )(validTenants)
  },
)

export const makeFilteredUsersSelector = (defaultParams = {}) => {
  return createSelector(
    [usersSelector, tenantsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (users, allTenants, params) => {
      const { systemUsers, orderBy, orderDirection } = params
      const blacklistedTenants = reject(isValidTenant, allTenants)
      const blacklistedTenantIds = pluck('id', blacklistedTenants)
      const filterUsers = filter<IUsersSelector>((user) => {
        return (
          (systemUsers || !isSystemUser(user)) &&
          user.username &&
          !adminUserNames.includes(user.username) &&
          !blacklistedTenantIds.includes(user.defaultProject)
        )
      })
      return pipe<IUsersSelector[], IUsersSelector[], IUsersSelector[]>(
        filterUsers,
        createSorter({ orderBy, orderDirection }),
      )(users)
    },
  )
}
