import context from '../../context'
import ActiveModel from '../ActiveModel'

const coll = () => context.sshKeys

// SSH keys do not have an id property, but frontend is reliant on it, so using name as id
class SshKey extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.fingerprint = params.fingerprint || ''
    this.name = params.name || ''
    this.public_key = params.public_key || ''
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)

  static findByName = name => SshKey.getCollection().find(x => x.name === name)

  asJson = () => {
    return {
      keypair: {
        fingerprint: this.fingerprint,
        name: this.name,
        public_key: this.public_key
      }
    }
  }

  asGraphQl = () => ({
    ...this.asJson(),
    __typename: 'SshKey',
  })
}

export default SshKey
