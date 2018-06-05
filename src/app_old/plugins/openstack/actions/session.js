import * as Keystone from '../api/keystone'
import * as registry from '../../../util/registry'

import {
  startLogin,
  loginSucceeded,
  loginFailed,
} from './login'

import {
  setTenants,
} from './tenants'

import { getStorage, setStorage } from '../../../core/common/pf9-storage'

// redux flux actions
export const setToken = token => { registry.setItem('token', token) }
export const setUnscopedToken = token => { registry.setItem('unscopedToken', token) }
export const setUsername = username => { registry.setItem('username', username) }

export const SET_CURRENT_SESSION = 'SET_CURRENT_SESSION'

export const setCurrentSession = ({ tenant, user, scopedToken, roles }) =>
  ({ type: SET_CURRENT_SESSION, payload: { tenant, user, scopedToken, roles } })

// Figure out which tenant to make the current tenant
export const getPreferredTenant = (tenants, lastTenant) => {
  const notAdmin = x => x.name !== 'admin'
  return tenants.find(x => (x.name === lastTenant) && notAdmin(x)) || tenants.find(notAdmin) || tenants[0]
}
export const getPreferredRegion = (regions, lastRegion) => {
  return (lastRegion && regions.find(x => x.id === lastRegion.id)) || regions[0]
}

const Session = (keystone = Keystone, mocks = {}) => {
  // This context stores methods that we might want to override in tests.
  let ctx

  const authenticate = async ({ username, password, mfa }) => {
    if (mfa) {
      password = password + mfa
    }
    return keystone.getUnscopedToken(username, password)
  }

  const getTenants = unscopedToken => keystone.getScopedProjects()
  const tenantStorageKey = username => `last-tenant-accessed-${username}`
  /* istanbul ignore next */
  const getLastTenant = username => getStorage(tenantStorageKey) || 'service'
  const setLastTenant = (username, tenant) => ctx.setStorage(tenantStorageKey(username), tenant)

  const regionStorageKey = username => `last-region-accessed-${username}`
  const getLastRegion = username => getStorage(regionStorageKey(username))
  const setLastRegion = (username, tenant) => ctx.setStorage(regionStorageKey(username), tenant)

  const initialSetup = async ({ username, unscopedToken, dispatch }) => {
    // Store in the in-memory "registry"
    ctx.setUnscopedToken(unscopedToken)
    ctx.setStorage('unscopedToken', unscopedToken)
    ctx.setToken(unscopedToken)
    ctx.setStorage('username', username)
    ctx.setUsername(username)

    dispatch(loginSucceeded())

    // Figure out and set the default tenant based on previous usage.
    const tenants = await keystone.getScopedProjects()
    const lastTenant = ctx.getLastTenant(username)
    const tenant = ctx.getPreferredTenant(tenants, lastTenant)
    setLastTenant(username, tenant.name)
    const response = await keystone.getScopedToken(tenant.id, unscopedToken)
    const { token, scopedToken } = response
    const { user, roles } = token

    // TODO: Do we need to do this at login time?  Can we push it to a component further down?
    const regions = await keystone.getRegions(unscopedToken)
    const lastRegion = ctx.getLastRegion(username)
    const region = ctx.getPreferredRegion(regions, lastRegion)
    setLastRegion(username, region)

    dispatch(ctx.setCurrentSession({
      region,
      roles,
      scopedToken,
      tenant,
      unscopedToken,
      user,
      username,
    }))
    dispatch(ctx.setTenants(tenants))
    return true
  }

  const restoreSession = async (dispatch) => {
    const username = getStorage('username')
    const unscopedToken = getStorage('unscopedToken')

    if (!unscopedToken) {
      return
    }

    // See if unscopedToken is still valid
    const newUnscopedToken = await keystone.renewUnscopedToken(unscopedToken)

    return initialSetup({ username, unscopedToken: newUnscopedToken, dispatch })
  }

  const signIn = ({ username, password, mfa }) => async dispatch => {
    dispatch(startLogin())
    // Authenticate the user
    const unscopedToken = await ctx.authenticate({ username, password, mfa })
    if (!unscopedToken) {
      dispatch(loginFailed())
      return false
    }

    await initialSetup({ username, unscopedToken, dispatch })

    return true
  }

  ctx = {
    authenticate,
    getLastRegion,
    getLastTenant,
    getPreferredRegion,
    getPreferredTenant,
    getTenants,
    keystone: Keystone,
    setCurrentSession,
    setStorage,
    setTenants,
    setToken,
    setUnscopedToken,
    setUsername,
    signIn,
    ...mocks // allow tests to override any of the above functions
  }

  return {
    signIn,
    authenticate,
    restoreSession,
  }
}

export default Session
