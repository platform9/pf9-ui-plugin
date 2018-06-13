import context from '../context'
import ActiveModel from './ActiveModel'
import { findById, updateById } from '../helpers'

const coll = () => context.volumes

class Volume extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.description = params.description || ''
    this.volume_type = params.volume_type || ''
    this.metadata = params.metadata || ''
    this.size = params.size || 10
    this.bootable = params.bootable || false
    this.status = params.status || ''
    this.tenant = params.tenant || ''
    this.source = params.source || 'None'
    this.host = params.host || ''
    this.instance = params.instance || ''
    this.device = params.device || ''
    this.attachedMode = params.attachedMode || ''
    this.readonly = params.readonly || false
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = updateById(coll)

  static findByName = name => Volume.getCollection().find(x => x.name === name)

  asJson = () => {
    return {
      ...super.asJson(),
      name: this.name,
      description: this.description,
      volume_type: this.volume_type,
      metadata: this.metadata,
      size: this.size,
      bootable: this.bootable,
      status: this.status,
      tenant: this.tenant,
      source: this.source,
      host: this.host,
      instance: this.instance,
      device: this.device,
      attachedMode: this.attachedMode,
      readonly: this.readonly,
      created_at: this.created_at
    }
  }

  asGraphQl = () => ({
    ...this.asJson(),
    __typename: 'Volume',
  })
}

export default Volume
