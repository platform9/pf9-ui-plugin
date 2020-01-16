/* eslint-disable camelcase */
import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById, mapAsJson } from '../../helpers'

const coll = () => context.tenantUsers

class TenantUser extends ActiveModel {
  constructor (tenant, users, params = {}) {
    super(tenant.asJson())
    const tenantUserParams = {
      enabled: true,
      domain_id: null,
      users,
      ...params
    }
    Object.assign(this, tenantUserParams, tenant.asJson())
    return this
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)

  addUser = user => this.users.push(user)

  asJson = () => ({
    ...super.asJson(),
    name: this.name,
    description: this.description,
    enabled: this.enabled,
    domain_id: this.domain_id,
    users: mapAsJson(this.users),
  })
}

export default TenantUser
