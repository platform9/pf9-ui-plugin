import {
  createTenant,
  deleteTenant,
} from '../api/keystone'

export const ADD_TENANT = 'ADD_TENANT'
export const SET_TENANTS = 'SET_TENANTS'
export const REMOVE_TENANT = 'REMOVE_TENANT'

export const setTenants = tenants => ({ type: SET_TENANTS, payload: tenants })

export const addTenant = tenant => async dispatch => {
  const tenantId = await createTenant(tenant)
  if (tenantId) {
    tenant.id = tenantId
    dispatch({ type: ADD_TENANT, payload: tenant })
  }
}

export const removeProject = projectId => async dispatch => {
  await deleteTenant(projectId)
  dispatch({ type: REMOVE_TENANT, payload: projectId })
}
