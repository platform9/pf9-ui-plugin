// TODO: fix these typings

import { TenantWithUsers, Tenant } from 'k8s/components/userManagement/tenants/model'
export interface IUsersSelector {
  id: string
  username: string
  displayname: string
  email: string
  defaultProject: string
  twoFactor: string
  tenants: Tenant[]
}
