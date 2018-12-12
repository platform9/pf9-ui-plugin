import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById, updateById } from '../../helpers'
import ResMgrRoles from './ResMgrRoles'

const coll = () => context.resMgrHosts

const G = 1000 * 1000 * 1000
const defaultUsed = 1.2 * G
const defaultTotal = 2.3 * G
const generateMockStat = (stat, units='GB', type='used', used=defaultUsed, total=defaultTotal) => ({
  [stat]: { used, total, units, type, available: total - used },
})

const generateMockUsageStats = () => ({
  resource_usage: {
    data: {
      ...generateMockStat('cpu', 'GHz'),
      ...generateMockStat('memory', 'GB'),
      ...generateMockStat('disk', 'GB'),
    }
  }
})

class ResMgrHost extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.roles = params.roles || []
    this.info = params.info || ''
    this.extensions = generateMockUsageStats()
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
      info: this.info,
      extensions: this.extensions,
    }
  }
}

export default ResMgrHost
