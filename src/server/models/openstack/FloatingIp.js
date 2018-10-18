import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById, updateById } from '../../helpers'

const coll = () => context.floatingIps

class FloatingIp extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.floating_ip_address = params.floating_ip_address
    this.subnet_id = params.subnet_id
    this.port_id = params.port_id
    this.project_id = params.project_id
    this.tenant_id = params.project_id
    this.fixed_ip_address = params.fixed_ip_address
    this.description = params.description
    this.floating_network_id = params.floating_network_id
    this.status = params.status
    this.router_id = params.router_id
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = updateById(coll)

  static findByFloatingIp = ip => FloatingIp.getCollection().find(x => x.floating_ip_address === ip)

  asJson = () => {
    return {
      ...super.asJson(),
      floating_ip_address: this.floating_ip_address,
      subnet_id: this.subnet_id,
      port_id: this.port_id,
      project_id: this.project_id,
      tenant_id: this.tenant_id,
      fixed_ip_address: this.fixed_ip_address,
      description: this.description,
      floating_network_id: this.floating_network_id,
      status: this.status,
      router_id: this.router_id
    }
  }

  asGraphQl = () => ({
    ...this.asJson(),
    __typename: 'FloatingIp',
  })
}

export default FloatingIp
