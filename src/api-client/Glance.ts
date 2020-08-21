import ApiService from 'api-client/ApiService'

/*
const op = op => (path, value) => ({ op: 'replace', path, value })
const addOp = op('add')
const removeOp = op('remove')
const replaceOp = op('replace')
*/

class Glance extends ApiService {
  clsName = 'glance'
  async endpoint() {
    return this.client.keystone.getServiceEndpoint('glance', 'admin')
  }

  v2 = async () => `${await this.endpoint()}/v2`

  imagesUrl = async () => `${await this.v2()}/images`

  async getImages() {
    const url = `${await this.imagesUrl()}?limit=1000`
    const response = await this.client.basicGet<any>('Glance', 'getImages', url)
    return response.images
  }

  async createImage(params) {
    const url = await this.imagesUrl()
    // TODO: support adding additional user properties
    try {
      const response = await this.client.basicPost('Glance', 'createImage', url, params)
      return response
    } catch (err) {
      console.log(err)
    }
  }

  async deleteImage(id) {
    const url = `${await this.imagesUrl()}/${id}`
    return this.client.basicDelete('Glance', 'deleteImage', url)
  }

  async getImageSchema() {
    const url = `${await this.v2()}/schemas/images`
    const response = await this.client.basicGet<any>('Glance', 'getImageSchema', url)
    return response.properties.images
  }

  async updateImage(image, imageId) {
    const url = `${await this.imagesUrl()}/${imageId}`
    const headers = {
      ...this.client.getAuthHeaders().headers,
      'Content-Type': 'application/openstack-images-v2.1-json-patch',
    }
    const response = await this.client.rawPatch('Glance', 'updateImage', url, image, { headers })
    return response.data
  }

  // The user should not be able to edit these fields at all.
  blacklistedImageProperties = ['locations', 'id']

  // We provide specific editors in the UI so don't let them be edited generically.
  hiddenImageProperties = ['owner', 'visibility', 'protected']

  get excludedImageFields() {
    return [...this.blacklistedImageProperties, ...this.hiddenImageProperties]
  }
}

export default Glance
