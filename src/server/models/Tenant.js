/* eslint-disable camelcase */
import context from '../context'
import ActiveModel from './ActiveModel'
import { findById } from '../helpers'

const coll = () => context.tenants

class Tenant extends ActiveModel {
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
      description: this.description,
    }
    return json
  }

  asGraphQl = () => ({
    ...this.asJson(),
    __typename: 'Tenant',
  })
}

export default Tenant
