/* eslint-disable camelcase */
import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById } from '../../helpers'

const coll = () => context.tenants

class Tenant extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.description = params.description || ''
    this.is_domain = false
    this.enabled = params.enabled !== false
    this.parent_id = params.parent_id || 'default'
    this.domain_id = params.domain_id || 'default'
    this.users = params.users || []
    return this
  }

  update (params = {}) {
    Object.assign(this, params)
    return this
  }

  addUser = user => this.users.push(user)
  addUsers = users => users.map(this.addUser)
  removeUser = user => this.users.splice(this.users.indexOf(user), 1)

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)

  asJson = withUsers => ({
    ...super.asJson(),
    name: this.name,
    description: this.description,
    enabled: this.enabled,
    is_domain: this.is_domain,
    parent_id: this.parent_id,
    domain_id: this.domain_id,
    ...withUsers ? {
      users: this.users.map(user => ({
        id: user.id,
        username: user.email || user.name,
        mfa: user.mfa,
        displayname: user.name || '',
        name: user.email || user.name,
        tenantId: user.default_project_id,
        enabled: true,
        email: user.email,
      })),
    } : {},
  })
}

export default Tenant
