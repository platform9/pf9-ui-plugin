import context from '../context'
import ActiveModel from './ActiveModel'
import { findById, updateById } from '../helpers'

const coll = () => context.sshKeys

// SSH keys do not have an id property, but frontend is reliant on it, so using name as id
class SshKey extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.id = params.name || ''
    this.fingerprint = params.fingerprint || ''
    this.name = params.name || ''
    this.public_key = params.public_key || ''
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = updateById(coll)

  static findByName = name => SshKey.getCollection().find(x => x.name === name)

  asJson = () => {
    return {
      ...super.asJson(),
      fingerprint: this.fingerprint,
      name: this.name,
      public_key: this.public_key
    }
  }

  asGraphQl = () => ({
    ...this.asJson(),
    __typename: 'SshKey',
  })
}

export default SshKey
