import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById } from '../../helpers'
import uuid from 'uuid'

const coll = () => context.hypervisors

// TODO: take a ResMgrHost object as a parameter?
class Hypervisor extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.service = {
      host: params.resMgrId || '',
      id: uuid.v4(),
      disabled_reason: null
    }
    this.status = params.status || ''
    this['OS-EXT-PF9-HYP-ATTR:networks'] = params.networks || []
    this['OS-EXT-PF9-HYP-ATTR:host_id'] = params.resMgrId || ''
    this['OS-EXT-PF9-HYP-ATTR:ip_info'] = params.ipInfo || []
    this.host_ip = params.host_ip || ''
    this.hypervisor_hostname = params.hypervisor_hostname || ''
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)

  asJson = () => {
    return {
      ...super.asJson(),
      service: this.service,
      status: this.status,
      'OS-EXT-PF9-HYP-ATTR:networks': this['OS-EXT-PF9-HYP-ATTR:networks'],
      'OS-EXT-PF9-HYP-ATTR:host_id': this['OS-EXT-PF9-HYP-ATTR:host_id'],
      'OS-EXT-PF9-HYP-ATTR:ip_info': this['OS-EXT-PF9-HYP-ATTR:ip_info'],
      host_ip: this.host_ip,
      hypervisor_hostname: this.hypervisor_hostname
    }
  }
}

export default Hypervisor
