import { prop } from 'ramda'

export enum UserRoles {
  Admin = 'admin',
  Member = '_member_'
  // TODO figure out what other roles we have for users
}
export const isAdminRole = (getContext) => {
  const ctx = getContext(prop('userDetails'))
  if (!ctx) {
    return false
  }
  return ctx.role === UserRoles.Admin
}
