import context from '../context'
import ActiveModel from './ActiveModel'
import { findById } from '../helpers'

const coll = () => context.networks

class Network extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)

  static findByName = name => Network.getCollection().find(x => x.name === name)

  asJson = () => {
    return {
      ...super.asJson(),
      name: this.name,
    }
  }
}

export default Network
