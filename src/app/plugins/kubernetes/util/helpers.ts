import { prop } from 'ramda'

export enum UserRoles {
  Admin = 'admin',
  Member = '_member_'
  // TODO figure out what other roles we have for users
}
export const isAdminRole = (getContext) => {
  const { role } = getContext(prop('userDetails'))
  return role === UserRoles.Admin
}
