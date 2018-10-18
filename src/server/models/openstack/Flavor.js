import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById, updateById } from '../../helpers'

const coll = () => context.flavors

class Flavor extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.disk = params.disk || 1
    this.ram = params.ram || 512
    this.vcpus = params.vcpus || 1
    this.public = params.public !== undefined ? params.public : false
    this.tags = params.tags || ''
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = updateById(coll)

  static findByName = name => Flavor.getCollection().find(x => x.name === name)

  asJson = () => {
    return {
      ...super.asJson(),
      name: this.name,
      disk: this.disk,
      ram: this.ram,
      vcpus: this.vcpus,
      public: this.public,
      tags: this.tags
    }
  }

  asGraphQl = () => ({
    ...this.asJson(),
    __typename: 'Flavor',
  })
}

export default Flavor
