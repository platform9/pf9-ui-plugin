/* eslint-disable camelcase */
import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById } from '../../helpers'

const coll = () => context.groups

class Group extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.description = params.description || ''
    this.domain_id = params.domain_id || 'default'
    this.links = params.links || {}
    return this
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)

  asJson = () => ({
    ...super.asJson(),
    name: this.name,
    description: this.description,
    displayName: this.displayName,
  })
}

export default Group
