import {
  SET_CURRENT_SESSION,
} from '../actions/session'

const initialState = {
  unscopedToken: null,
  scopedToken: null,
  user: null,
  roles: null,
}

const reducer = (state = initialState, action) => {
  const { type, payload } = action // eslint-disable-line no-unused-vars

  switch (type) {
    case SET_CURRENT_SESSION:
      return { ...state, ...payload }

    default:
      return state
  }
}

export default reducer
