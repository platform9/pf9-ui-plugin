/* eslint-disable camelcase */
import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById } from '../../helpers'

const coll = () => context.tenantUsers

class TenantUser extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.description = params.description || ''
    this.enabled = params.enabled || ''
    this.domain_id = params.domain_id || ''
    this.users = params.users || []
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
    users: this.users,
  })
}

export default TenantUser
