import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById, updateById } from '../../helpers'
import ResMgrRoles from './ResMgrRoles'

const coll = () => context.resMgrHosts

class ResMgrHost extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.roles = params.roles || []
    this.info = params.info || ''
    ResMgrRoles.newResMgrHost(this.id)
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = updateById(coll)
  static getHostRole = (id, role) => {
    return ResMgrRoles.getHostRole(id, role)
  }
  static updateHostRole = (id, role, input) => {
    const resMgrHost = this.findById(id)
    if (!resMgrHost) {
      return null
    }
    return ResMgrRoles.updateHostRole(id, role, input)
  }

  asJson = () => {
    return {
      ...super.asJson(),
      roles: this.roles,
      info: this.info
    }
  }
}

export default ResMgrHost
