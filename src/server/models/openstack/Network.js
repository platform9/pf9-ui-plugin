import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById, updateById } from '../../helpers'

const coll = () => context.networks

class Network extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.subnets = params.subnets || ''
    this.tenant = params.tenant || ''
    this.shared = params.shared || false
    this.port_security_enabled = params.port_security_enabled || false
    this.external = params.external || false
    this.admin_state_up = params.admin_state_up || false
    this.status = params.status || ''
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = updateById(coll)

  static findByName = name => Network.getCollection().find(x => x.name === name)

  asJson = () => {
    return {
      ...super.asJson(),
      name: this.name,
      subnets: this.subnets,
      tenant: this.tenant,
      shared: this.shared,
      port_security_enabled: this.port_security_enabled,
      external: this.external,
      admin_state_up: this.admin_state_up,
      status: this.status
    }
  }

  asGraphQl = () => ({
    ...this.asJson(),
    __typename: 'Network',
  })
}

export default Network
