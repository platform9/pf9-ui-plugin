import { uuidRegex } from 'app/constants'

export enum LoginMethodTypes {
  Local = 'local',
  SSO = 'sso',
}

export const isSystemUser = ({ username }) => {
  const isUuid = uuidRegex.test(username)
  return isUuid || username === 'kplane-clustmgr'
}
