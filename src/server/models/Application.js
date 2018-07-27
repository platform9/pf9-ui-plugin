import context from '../context'
import ActiveModel from './ActiveModel'
import { findById, updateById } from '../helpers'

const coll = () => context.applications

class Application extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.author = params.author || ''
    this.tenant = params.tenant || ''
    this.public = params.public !== undefined ? params.public : false
    this.tags = params.tags || ''
    this.description = params.description || ''
    this.categories = params.categories || ''
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = updateById(coll)

  static findByName = name => Application.getCollection().find(x => x.name === name)

  asJson = () => {
    return {
      ...super.asJson(),
      name: this.name,
      author: this.author,
      public: this.public,
      tags: this.tags,
      tenant: this.tenant,
      description: this.description,
      categories: this.categories
    }
  }

  asGraphQl = () => ({
    ...this.asJson(),
    __typename: 'Application',
  })
}

export default Application
