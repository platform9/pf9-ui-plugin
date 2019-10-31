import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import {
  mngmTenantsCacheKey, filterValidTenants,
} from 'k8s/components/userManagement/tenants/actions'
import {
  partition, pluck, map, head, innerJoin, uniq, prop, pipe, find, propEq, when, isNil, always,
  filter, flatten, groupBy, values,
} from 'ramda'
import { emptyObj, upsertAllBy } from 'utils/fp'
import { uuidRegex } from 'app/constants'
import createContextLoader from 'core/helpers/createContextLoader'

const { keystone } = ApiClient.getInstance()

const isSystemUser = ({ username }) => {
  return uuidRegex.test(username)
}
export const mngmCredentialsCacheKey = 'managementCredentials'
createContextLoader(mngmCredentialsCacheKey, () => keystone.getCredentials())

const adminUserNames = ['heatadmin', 'admin@platform9.net']
export const mngmUsersCacheKey = 'managementUsers'
export const mngmUserActions = createCRUDActions(mngmUsersCacheKey, {
  listFn: async () => {
    return keystone.getUsers()
  },
  dataMapper: async (users, { systemUsers }, loadFromContext) => {
    const [credentials, allTenants] = await Promise.all([
      loadFromContext(mngmCredentialsCacheKey),
      loadFromContext(mngmTenantsCacheKey, { includeBlacklisted: true }),
    ])
    const [validTenants, blacklistedTenants] = partition(filterValidTenants, allTenants)
    const blacklistedTenantIds = pluck('id', blacklistedTenants)

    // Get all tenant users and assign their corresponding tenant ID
    const pluckUsers = map(tenant =>
      tenant.users.map(user => ({
        ...user,
        tenantId: tenant.id,
      })),
    )

    // Unify all users with the same ID
    const unifyTenantUsers = map(groupedUsers => ({
      ...head(groupedUsers),
      // Get user tenant names and concat them with commas
      tenants: innerJoin(
        (tenant, id) => tenant.id === id,
        validTenants,
        uniq(pluck('tenantId', groupedUsers)),
      ).map(prop('name')).join(', '),
    }))

    const allUsers = users.map(user => ({
      id: user.id,
      username: user.name,
      displayname: user.displayname,
      email: user.email,
      defaultProject: user.default_project_id,
      twoFactor: pipe(
        find(propEq('user_id', user.id)),
        when(isNil, always(emptyObj)),
        propEq('type', 'totp'),
        mfaEnabled => mfaEnabled ? 'enabled' : 'disabled',
      )(credentials),
    }))

    const filterUsers = filter(user => {
      return (systemUsers || !isSystemUser(user)) &&
        user.username &&
        !adminUserNames.includes(user.username) &&
        !blacklistedTenantIds.includes(user.defaultProject)
    })

    return pipe(
      pluckUsers,
      flatten,
      groupBy(prop('id')),
      values,
      unifyTenantUsers,
      upsertAllBy(prop('id'), allUsers),
      filterUsers,
    )(validTenants)
  },
})
