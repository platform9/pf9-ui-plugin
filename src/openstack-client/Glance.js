import axios from 'axios'

/*
const op = op => (path, value) => ({ op: 'replace', path, value })
const addOp = op('add')
const removeOp = op('remove')
const replaceOp = op('replace')
*/

class Glance {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.glance.admin.url
    return endpoint
  }

  v2 = async () => `${await this.endpoint()}/v2`

  imagesUrl = async () => `${await this.v2()}/images`

  async getImages () {
    const url = `${await this.imagesUrl()}?limit=1000`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.images
  }

  async createImage (params) {
    const url = await this.imagesUrl()
    // TODO: support adding additional user properties
    try {
      const response = await axios.post(url, params, this.client.getAuthHeaders())
      return response.data
    } catch (err) {
      console.log(err)
    }
  }

  async deleteImage (id) {
    const url = `${await this.imagesUrl()}/${id}`
    const response = await axios.delete(url, this.client.getAuthHeaders())
    return response
  }

  async getImageSchema () {
    const url = `${await this.v2()}/schemas/images`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.properties.images
  }

  async updateImage (image, imageId) {
    const url = `${await this.imagesUrl()}/${imageId}`
    const headers = {
      ...this.client.getAuthHeaders().headers,
      'Content-Type': 'application/openstack-images-v2.1-json-patch',
    }
    const response = await axios.patch(url, image, { headers })
    return response.data
  }

  // The user should not be able to edit these fields at all.
  blacklistedImageProperties = [
    'locations',
    'id'
  ]

  // We provide specific editors in the UI so don't let them be edited generically.
  hiddenImageProperties = [
    'owner',
    'visibility',
    'protected',
  ]

  get excludedImageFields () {
    return [
      ...this.blacklistedImageProperties,
      ...this.hiddenImageProperties,
    ]
  }
}

export default Glance
