import { path } from 'ramda'
import Role from './Role'
import Tenant from './Tenant'
import context from '../../context'
import { findById, updateById } from '../../helpers'
import ActiveModel from '../ActiveModel'

const coll = () => context.users

class User extends ActiveModel {
  constructor(params = {}) {
    super(params)
    // These fields have a lot of overlap and it's a bit unclear what is needed and what is not.
    // We should clean this up once we can figure out more specifically what fields should be used.
    this.name = params.name || params.email || ''
    this.email = params.email || ''
    this.mfa = params.mfa || { enabled: false }
    this.password = params.password
    this.roles = params.roles || []
    this.tenantId = params.tenantId || ''
    this.username = params.username || params.name || params.email || ''
    this.enabled = params.enabled !== false
    this.is_local = params.is_local !== false
    this.domain_id = params.domain_id || 'default'
    this.default_project_id = params.tenantId
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = updateById(coll)

  static findByUsername = (username) => User.getCollection().find((x) => x.username === username)

  static getAuthenticatedUser = (username, password) => {
    const user = User.findByUsername(username)
    if (!user) {
      return null
    }
    const attemptedPassword = `${password}${path(['mfa', 'enabled'], user) ? '1' : ''}`
    return user.password === attemptedPassword ? user : null
  }

  update(params = {}) {
    Object.assign(this, params)
    return this
  }

  // TODO
  getTenants = () => []

  addRole = (tenant, role) => this.roles.push({ tenant, role })
  removeRole = (tenantId, roleId) => {
    const idx = this.roles.findIndex(
      ({ tenant, role }) => tenant.id === tenantId && role.id === roleId,
    )
    if (idx == null) {
      throw new Error('User role not found')
    }
    this.roles.splice(idx, 1)
    return this.roles
  }

  get rolePair() {
    return this.roles.map(({ tenant, role }) =>
      JSON.stringify({
        tenant: Tenant.findById(tenant.id).name,
        role: Role.findById(role.id).name,
      }),
    )
  }

  asJson = () => {
    return {
      ...super.asJson(),
      name: this.name,
      email: this.email,
      description: this.description,
      is_local: true,
      password_expires_at: null,
      enabled: this.enabled,
      mfa: this.mfa,
      default_project_id: this.tenantId,
      domain_id: this.domain_id,
    }
  }
}

export default User
