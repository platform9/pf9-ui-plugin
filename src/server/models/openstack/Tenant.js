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
    return this
  }

  update (params = {}) {
    Object.assign(this, params)
    return this
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)

  asJson = () => ({
    ...super.asJson(),
    name: this.name,
    description: this.description,
    enabled: this.enabled,
    is_domain: this.is_domain,
    parent_id: this.parent_id,
    domain_id: this.domain_id,
  })
}

export default Tenant
