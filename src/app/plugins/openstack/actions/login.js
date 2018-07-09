export const START_LOGIN = 'START_LOGIN'
export const LOGIN_SUCCEEDED = 'LOGIN_SUCCEEDED'
export const LOGIN_FAILED = 'LOGIN_FAILED'
export const LOG_OUT = 'LOG_OUT'

export const startLogin = () => ({ type: START_LOGIN })
export const loginSucceeded = () => ({ type: LOGIN_SUCCEEDED })
export const loginFailed = () => ({ type: LOGIN_FAILED })

export const logOut = () => ({ type: LOG_OUT })
