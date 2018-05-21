/* eslint-disable camelcase */
import context from '../context'
import ActiveModel from './ActiveModel'
import { findById, mapAsJson, jsonOrNull } from '../helpers'

const coll = () => context.tokens

class Token extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.user = params.user || null
    this.roles = (this.user && this.user.roles) || []
    this.tenant = params.tenant || null
    return this
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)

  static validateToken = tokenId => Token.findById(tokenId) || null

  asJson = () => {
    const json = {
      ...super.asJson(),
      project: jsonOrNull(this.tenant),
      roles: mapAsJson(this.roles),
      user: jsonOrNull(this.user),
    }
    return json
  }
}

export default Token
