import ApiService from 'api-client/ApiService'
import { trackApiMethodMetadata } from './helpers'

/*
const op = op => (path, value) => ({ op: 'replace', path, value })
const addOp = op('add')
const removeOp = op('remove')
const replaceOp = op('replace')
*/

class Glance extends ApiService {
  public getClassName() {
    return 'glance'
  }

  protected async getEndpoint() {
    return this.client.keystone.getServiceEndpoint('glance', 'admin')
  }

  v2 = () => `/v2`

  imagesUrl = () => `${this.v2()}/images`

  @trackApiMethodMetadata({ url: '/v2/images?limit=1000', type: 'GET' })
  async getImages() {
    const response = await this.client.basicGet<any>({
      url: `${this.imagesUrl()}?limit=1000`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getImages',
      },
    })
    return response.images
  }

  async createImage(params) {
    // TODO: support adding additional user properties
    try {
      const response = await this.client.basicPost({
        url: this.imagesUrl(),
        body: params,
        options: {
          clsName: this.getClassName(),
          mthdName: 'createImage',
        },
      })
      return response
    } catch (err) {
      console.log(err)
    }
  }

  async deleteImage(id) {
    const url = `${this.imagesUrl()}/${id}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteImage',
      },
    })
  }

  @trackApiMethodMetadata({ url: '/v2/schemas/images', type: 'GET' })
  async getImageSchema() {
    const url = `${this.v2()}/schemas/images`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getImageSchema',
      },
    })
    return response.properties.images
  }

  async updateImage(image, imageId) {
    const url = `${this.imagesUrl()}/${imageId}`
    const headers = {
      ...this.client.getAuthHeaders().headers,
      'Content-Type': 'application/openstack-images-v2.1-json-patch',
    }
    const response = await this.client.rawPatch({
      url,
      data: image,
      config: {
        headers,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateImage',
      },
    })
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
