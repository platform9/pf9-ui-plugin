import {
  ADD_TENANT,
  REMOVE_TENANT,
  SET_TENANTS,
} from '../actions/tenants'

const initialState = {
  tenantsLoaded: false,
  tenants: [],
}

const reducer = (state = initialState, action) => {
  const { type, payload } = action // eslint-disable-line no-unused-vars

  switch (type) {
    case ADD_TENANT:
      return {
        ...state,
        tenants: [...state.tenants, payload]
      }

    case SET_TENANTS:
      return {
        ...state,
        tenants: payload,
        tenantsLoaded: true,
      }

    case REMOVE_TENANT:
      return {
        ...state,
        tenants: state.tenants.filter(tenant => tenant.id !== payload)
      }

    default:
      return state
  }
}

export default reducer
