/* eslint-disable camelcase */
import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById } from '../../helpers'

const coll = () => context.mappings

class Mapping extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.links = params.links || {}
    this.rules = params.rules || []
    return this
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)

  asJson = () => ({
    ...super.asJson(),
    links: this.links,
    rules: this.rules,
  })
}

export default Mapping
