import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById, updateById } from '../../helpers'

const coll = () => context.routers

class Router extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.tenant_id = params.tenant_id || ''
    this.admin_state_up = params.admin_state_up || false
    this.status = params.status || ''
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = updateById(coll)

  static findByName = name => Router.getCollection().find(x => x.name === name)

  asJson = () => {
    return {
      ...super.asJson(),
      name: this.name,
      tenant_id: this.tenant_id,
      admin_state_up: this.admin_state_up,
      status: this.status
    }
  }
}

export default Router
