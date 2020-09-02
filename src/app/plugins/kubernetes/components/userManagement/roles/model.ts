import { Role } from 'api-client/keystone.model'

export interface IRolesSelector extends Role {
  name: string
  description: string
}
