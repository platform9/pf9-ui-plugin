import { originUsernameRegex, uuidRegex } from 'app/constants'

export enum LoginMethodTypes {
  Local = 'local',
  SSO = 'sso',
}

export const isSystemUser = ({ username }) => {
  const { groups = {} } = originUsernameRegex.exec(window.location.origin) || {}
  const { originUsername = null } = groups
  const isOriginUsername = username.includes(originUsername)

  const isUuid = uuidRegex.test(username)
  return isOriginUsername || isUuid || username === 'kplane-clustmgr'
}
