import { prop } from 'ramda'

export enum UserRoles {
  Admin = 'admin',
  Member = '_member_',
  // TODO figure out what other roles we have for users
}

export const isAdminRole = (session) => {
  const user = prop('userDetails', session)
  if (!user) {
    return false
  }
  return user.role === UserRoles.Admin
}
