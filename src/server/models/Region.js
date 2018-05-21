/* eslint-disable camelcase */
import context from '../context'
import ActiveModel from './ActiveModel'
import { findById } from '../helpers'

const coll = () => context.regions

class Region extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.description = params.description || ''
    return this
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)

  asJson = () => {
    const json = {
      ...super.asJson(),
      name: this.name,
    }
    return json
  }
}

export default Region
