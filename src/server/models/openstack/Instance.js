import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById, updateById } from '../../helpers'

const coll = () => context.instances

class Instance extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.status = params.status || 'ACTIVE'
    this['OS-EXT-STS:vm_state'] = params.state || ''
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = updateById(coll)

  static findByName = name => Instance.getCollection().find(x => x.name === name)

  asJson = () => {
    return {
      ...super.asJson(),
      name: this.name,
      status: this.status,
      'OS-EXT-STS:vm_state': this['OS-EXT-STS:vm_state']
    }
  }
}

export default Instance
