import context from '../context'
import ActiveModel from './ActiveModel'
import { findById } from '../helpers'

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
    this.tenant = params.tenant
    this.username = params.username || params.name || params.email || ''
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)

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

  asJson = () => {
    return {
      ...super.asJson(),
      displayname: this.displayname,
      email: this.email,
      name: this.name,
      username: this.username,
    }
  }
}

export default User
