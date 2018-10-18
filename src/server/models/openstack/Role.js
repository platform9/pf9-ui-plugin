/* eslint-disable camelcase */
import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById } from '../../helpers'

const coll = () => context.roles

class Role extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.description = params.description || ''
    this.displayName = params.displayName || ''
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
      displayName: this.displayName,
    }
    return json
  }

  asGraphQl = () => ({
    ...this.asJson(),
    __typename: 'Role',
  })
}

export default Role
