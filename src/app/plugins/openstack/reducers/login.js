import {
  START_LOGIN,
  LOGIN_SUCCEEDED,
  LOGIN_FAILED,
  LOG_OUT,
} from '../actions/login'

const initialState = {
  startLogin: false,
  loginFailed: false,
  loginSucceeded: false,
}

const reducer = (state = initialState, action) => {
  const { type, payload } = action // eslint-disable-line no-unused-vars

  switch (type) {
    case START_LOGIN:
      return {
        ...state,
        startLogin: true,
        loginSucceeded: false,
        loginFailed: false,
      }

    case LOGIN_SUCCEEDED:
      return {
        ...state,
        startLogin: false,
        loginSucceeded: true,
      }

    case LOGIN_FAILED:
      return {
        ...state,
        startLogin: false,
        loginFailed: true,
      }

    case LOG_OUT:
      return initialState

    default:
      return state
  }
}

export default reducer
