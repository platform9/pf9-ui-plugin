import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById, updateById } from '../../helpers'

const coll = () => context.users

class User extends ActiveModel {
  constructor (params = {}) {
    super(params)
    // These fields have a lot of overlap and it's a bit unclear what is needed and what is not.
    // We should clean this up once we can figure out more specifically what fields should be used.
    this.displayname = params.displayname || params.name || params.email || ''
    this.name = params.name || params.email || ''
    this.email = params.email || ''
    this.mfa = params.mfa || false
    this.password = params.password
    this.roles = params.roles || []
    this.tenantId = params.tenantId || ''
    this.username = params.username || params.name || params.email || ''
    this.rolePair = params.rolePair || []
    this.enabled = params.enabled !== false
    this.is_local = params.is_local !== false
    this.domain_id = params.domain_id || 'default'
    this.default_project_id = params.tenantId
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = updateById(coll)

  static findByUsername = username => User.getCollection().find(x => x.username === username)

  static getAuthenticatedUser = (username, password) => {
    const user = User.findByUsername(username)
    if (!user) {
      return null
    }
    const attemptedPassword = `${password}${user.mfa || ''}`
    return user.password === attemptedPassword ? user : null
  }

  // TODO
  getTenants = () => []

  addRole = (tenant, role) => this.roles.push({ tenant, role })
  removeRole = (tenantId, roleId) => {
    const idx = this.roles.findIndex(({ tenant, role }) =>
      tenant.id === tenantId && role.id === roleId)
    if (!idx) {
      throw new Error('User role not found')
    }
    this.roles.splice(idx, 1)
    return this.roles
  }

  asJson = () => {
    return {
      ...super.asJson(),
      displayname: this.displayname,
      email: this.email,
      name: this.name,
      enabled: this.enabled,
      username: this.username,
      default_project_id: this.tenantId,
      roles: this.roles,
      rolePair: this.rolePair,
      domain_id: this.domain_id
    }
  }
}

export default User
