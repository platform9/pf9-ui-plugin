// TODO: fix these typings

import { Tenant } from 'api-client/keystone.model'

export interface IUsersSelector {
  id: string
  username: string
  displayname: string
  email: string
  defaultProject: string
  twoFactor: string
  tenants: Tenant[]
}
