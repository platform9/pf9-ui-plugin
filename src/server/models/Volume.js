import context from '../context'
import ActiveModel from './ActiveModel'
import { findById } from '../helpers'

const coll = () => context.volumes

class Volume extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.description = params.description || ''
    this.type = params.type || ''
    this.metadata = params.metadata || ''
    this.size = params.size || 10
    this.sizeUnit = params.sizeUnit || 'GB'
    this.bootable = params.bootable !== undefined ? params.bootable : false
    this.status = params.status || ''
    this.tenantId = params.tenantId || ''
    this.tenant = params.tenant || ''
    this.source = params.source || 'Empty'
    this.host = params.host || ''
    this.instance = params.instance || ''
    this.instanceId = params.instanceId || ''
    this.device = params.device || ''
    this.attachedMode = params.attachedMode || ''
    this.readonly = params.readonly !== undefined ? params.readonly : false
    this.created = new Date().toISOString()
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)

  static findByName = name => Volume.getCollection().find(x => x.name === name)

  asJson = () => {
    return {
      ...super.asJson(),
      name: this.name,
      description: this.description,
      type: this.type,
      metadata: this.metadata,
      size: this.size,
      sizeUnit: this.sizeUnit,
      bootable: this.bootable,
      status: this.status,
      tenantId: this.tenantId,
      tenant: this.tenant,
      source: this.source,
      host: this.host,
      instance: this.instance,
      instanceId: this.instanceId,
      device: this.device,
      attachedMode: this.attachedMode,
      readonly: this.readonly,
      created: this.created
    }
  }

  asGraphQl = () => ({
    ...this.asJson(),
    __typename: 'Volume',
  })
}

export default Volume
