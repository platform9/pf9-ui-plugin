import context from '../../context'
import ActiveModel from '../ActiveModel'
import { findById, updateById } from '../../helpers'

const coll = () => context.images

class Image extends ActiveModel {
  constructor (params = {}) {
    super(params)
    this.name = params.name || ''
    this.status = params.status || ''
    this.pf9_description = params.pf9_description || ''
    this.container_format = params.container_format || ''
    this.disk_format = params.disk_format || ''
    this.updated_at = params.updated_at || ''
    this.visibility = params.visibility || ''
    this.file = params.file || ''
    this.size = params.size || 0
    this.self = params.self || ''
    this.min_disk = params.min_disk || 0
    this.min_ram = params.min_ram || 0
    this.protected = params.protected || false
    this.checksum = params.checksum || ''
    this.owner = params.owner || ''
    this.schema = params.schema || ''
    this.virtual_size = params.virtual_size || 0
    this.tags = params.tags || ''
  }

  static getCollection = coll
  static clearCollection = () => coll().splice(0, coll().length)
  static findById = findById(coll)
  static updateById = (imageId, attributes) => {
    // Translate glance update body to objects with the attributes
    // Need to account for deletes?
    const data = attributes.reduce((data, attr) => {
      data[attr.path.substring(1)] = attr.value
      return data
    }, {})
    return updateById(coll)(imageId, data)
  }

  static findByName = name => Image.getCollection().find(x => x.name === name)

  asJson = () => {
    return {
      ...super.asJson(),
      name: this.name,
      status: this.status,
      pf9_description: this.pf9_description,
      container_format: this.container_format,
      disk_format: this.disk_format,
      updated_at: this.updated_at,
      visibility: this.visibility,
      file: this.file,
      size: this.size,
      self: this.self,
      min_disk: this.min_disk,
      min_ram: this.min_ram,
      protected: this.protected,
      checksum: this.checksum,
      owner: this.owner,
      schema: this.schema,
      virtual_size: this.virtual_size,
      tags: this.tags,
      created_at: this.created_at
    }
  }
}

export default Image
