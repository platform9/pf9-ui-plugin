/* eslint-disable camelcase */
import ApiService from 'api-client/ApiService'
import { trackApiMethodMetadata } from './helpers'

class Cinder extends ApiService {
  public getClassName() {
    return 'cinder'
  }

  protected async getEndpoint() {
    return this.client.keystone.getServiceEndpoint('cinderv3', 'admin')
  }

  volumesUrl = () => '/volumes'

  async getRegionUrls() {
    const services = (await this.client.keystone.getServiceCatalog()).find(
      (x) => x.name === 'cinderv3',
    ).endpoints
    const baseUrlsByRegion = services.reduce((accum, service) => {
      accum[service.region] = service.url
      return accum
    }, {})
    return baseUrlsByRegion
  }

  @trackApiMethodMetadata({ url: '/volumes/{volumeId', type: 'GET', params: ['volumeId'] })
  async getVolume(id) {
    const response = await this.client.basicGet<any>({
      url: `${this.volumesUrl()}/${id}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getVolume',
      },
    })
    return response.volume
  }

  // Get volumes with details
  @trackApiMethodMetadata({ url: '/volumes/detail', type: 'GET' })
  async getVolumes() {
    const response = await this.client.basicGet<any>({
      url: `${this.volumesUrl()}/detail`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getVolumes',
      },
    })
    return response.volumes
  }

  @trackApiMethodMetadata({ url: '/volumes/detail?all_tenants=1', type: 'GET' })
  async getAllVolumes() {
    const response = await this.client.basicGet<any>({
      url: `${this.volumesUrl()}/detail?all_tenants=1`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getAllVolumes',
      },
    })
    return response.volumes
  }

  @trackApiMethodMetadata({
    url: '/volumes/detail?limit={limit}&marker={markerId}&{allTenants?}',
    type: 'GET',
    params: ['limit', 'allTenants', 'markerId'],
  })
  async getAllVolumesCount(limit, allTenants, markerId) {
    const baseUrl = `${this.volumesUrl()}/detail`
    const limitUrl = `?limit=${limit}`
    const projectUrl = allTenants ? '&all_tenants=1' : ''
    const markerUrl = markerId ? `&marker=${markerId}` : ''
    const url = baseUrl + limitUrl + projectUrl + markerUrl
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getAllVolumesCount',
      },
    })
    return response.volumes
  }

  async createVolume(params) {
    const response = await this.client.basicPost<any>({
      url: this.volumesUrl(),
      body: {
        volume: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'createVolume',
      },
    })
    return response.volume
  }

  async deleteVolume(id) {
    return this.client.basicDelete<any>({
      url: `${this.volumesUrl()}/${id}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteVolume',
      },
    })
  }

  async updateVolume(id, params) {
    const response = await this.client.basicPut<any>({
      url: `${this.volumesUrl()}/${id}`,
      body: {
        volume: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateVolume',
      },
    })
    return response.volume
  }

  async setBootable(id, bool) {
    const response = await this.client.basicPost<any>({
      url: `${this.volumesUrl()}/${id}/action`,
      body: {
        'os-set_bootable': { bootable: bool },
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'setBootable',
      },
    })
    return response.volume
  }

  // TODO: Test case for extend function
  // TODO: Current API doesn't work on AWS. Need to implement check logic in test.
  async extendVolume(id, size) {
    const response = await this.client.basicPost<any>({
      url: `${this.volumesUrl()}/${id}/action`,
      body: {
        'os-extend': { 'new-size': size },
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'extendVolume',
      },
    })
    return response.volume
  }

  // TODO: test case for reset function (Instance implement needed. Attach function needed?)
  async resetVolumeStatus(id) {
    const response = await this.client.basicPost<any>({
      url: `${this.volumesUrl()}/${id}/action`,
      body: {
        'os-reset_status': {
          status: 'available',
          attach_status: 'detached',
        },
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'resetVolumeStatus',
      },
    })
    return response.volume
  }

  // TODO: test case for upload function (Image implement needed)
  async uploadVolumeAsImage(id, image) {
    const response = await this.client.basicPost<any>({
      url: `${this.volumesUrl()}/${id}/action`,
      body: {
        'os-volume_upload_image': {
          container_format: 'bare',
          force: image.force,
          image_name: image.name,
          disk_format: image.diskFormat || 'raw',
        },
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'uploadVolumeAsImage',
      },
    })
    return response.volume
  }

  @trackApiMethodMetadata({ url: '/types', type: 'GET' })
  async getVolumeTypes() {
    const response = await this.client.basicGet<any>({
      url: `/types`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getVolumeTypes',
      },
    })
    return response.volume_types
  }

  async getVolumeType(name) {
    const volumeTypes = await this.getVolumeTypes()
    return volumeTypes.find((x) => x.name === name)
  }

  async createVolumeType(params) {
    await this.client.basicPost<any>({
      url: `/types`,
      body: {
        volume_type: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'createVolumeType',
      },
    })
    return this.getVolumeType(params.name)
  }

  async deleteVolumeType(id) {
    await this.client.basicDelete<any>({
      url: `/types/${id}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteVolumeType',
      },
    })
  }

  async updateVolumeType(id, params, keysToDelete = []) {
    const { extra_specs: extraSpecs, ...rest } = params
    const baseResponse = await this.client.basicPut<any>({
      url: `/types/${id}`,
      body: {
        volume_type: rest,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateVolumeType',
      },
    })
    await this.client.basicPost<any>({
      url: `/types/${id}/extra_specs`,
      body: {
        extra_specs: extraSpecs,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateVolumeType/extra_specs',
      },
    })
    await Promise.all(
      keysToDelete.map(async (key) => {
        return this.client.basicDelete<any>({
          url: `/types/${id}/extra_specs/${key}`,
          options: {
            clsName: this.getClassName(),
            mthdName: `updateVolumeType/delete/${key}`,
          },
        })
      }),
    )
    return baseResponse
  }

  async unsetVolumeTypeTag(id, tag) {
    await this.client.basicDelete<any>({
      url: `/types/${id}/extra_specs/${tag}`,
      options: {
        clsName: this.getClassName(),
        mthdName: `unsetVolumeTypeTag`,
      },
    })
  }

  @trackApiMethodMetadata({ url: '/snapshots/detail', type: 'GET' })
  async getSnapshots() {
    const response = await this.client.basicGet<any>({
      url: `/snapshots/detail`,
      options: {
        clsName: this.getClassName(),
        mthdName: `getSnapshots`,
      },
    })
    return response.snapshots
  }

  @trackApiMethodMetadata({ url: '/snapshots/detail?all_tenants=1', type: 'GET' })
  async getAllSnapshots() {
    const response = await this.client.basicGet<any>({
      url: `/snapshots/detail?all_tenants=1`,
      options: {
        clsName: this.getClassName(),
        mthdName: `getAllSnapshots`,
      },
    })
    return response.snapshots
  }

  async snapshotVolume(params) {
    const response = await this.client.basicPost<any>({
      url: `/snapshots`,
      body: {
        snapshot: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: `snapshotVolume`,
      },
    })
    return response.snapshot
  }

  async deleteSnapshot(id) {
    await this.client.basicDelete<any>({
      url: `/snapshots/${id}`,
      options: {
        clsName: this.getClassName(),
        mthdName: `deleteSnapshot`,
      },
    })
  }

  async updateSnapshot(id, params) {
    const response = await this.client.basicPut<any>({
      url: `/snapshots/${id}`,
      body: {
        snapshot: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: `updateSnapshot`,
      },
    })
    return response.snapshot
  }

  async updateSnapshotMetadata(id, params) {
    const response = await this.client.basicPut<any>({
      url: `/snapshots/${id}/metadata`,
      body: {
        metadata: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: `updateSnapshotMetadata`,
      },
    })
    return response.metadata
  }

  @trackApiMethodMetadata({ url: '/os-quota-class-sets/defaults', type: 'GET' })
  async getDefaultQuotas() {
    const quotas = await this.client.basicGet<any>({
      url: `/os-quota-class-sets/defaults`,

      options: {
        clsName: this.getClassName(),
        mthdName: `getDefaultQuotas`,
      },
    })
    return quotas.quota_class_set
  }

  @trackApiMethodMetadata({ url: '/os-quota-class-sets/defaults', type: 'GET' })
  async getDefaultQuotasForRegion(region) {
    const urls = await this.getRegionUrls()
    const quotas = await this.client.basicGet<any>({
      endpoint: urls[region],
      url: `/os-quota-class-sets/defaults`,
      options: {
        clsName: this.getClassName(),
        mthdName: `getDefaultQuotasForRegion`,
      },
    })
    return quotas.quota_class_set
  }

  @trackApiMethodMetadata({
    url: '/os-quota-sets/{projectId}?usage=true/os-quota-class-sets/defaults',
    type: 'GET',
    params: ['projectId'],
  })
  async getQuotas(projectId) {
    const quota = await this.client.basicGet<any>({
      endpoint: `/os-quota-sets/${projectId}?usage=true`,
      url: `/os-quota-class-sets/defaults`,
      options: {
        clsName: this.getClassName(),
        mthdName: `getQuotas`,
      },
    })
    return quota.quota_set
  }

  async getQuotasForRegion(projectId, region) {
    const urls = await this.getRegionUrls()
    const quota = await this.client.basicGet<any>({
      endpoint: urls[region],
      url: `/os-quota-sets/${projectId}?usage=true`,
      options: {
        clsName: this.getClassName(),
        mthdName: `getQuotasForRegion`,
      },
    })
    return quota.quota_set
  }

  async setQuotas(params, projectId) {
    const quotas = await this.client.basicPut<any>({
      url: `/os-quota-sets/${projectId}`,
      body: {
        quota_set: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: `setQuotas`,
      },
    })
    return quotas.quota_set
  }

  async setQuotasForRegion(params, projectId, region) {
    const urls = await this.getRegionUrls()
    const quotas = await this.client.basicPut<any>({
      endpoint: urls[region],
      url: `/os-quota-sets/${projectId}`,
      body: {
        quota_set: params,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: `setQuotasForRegion`,
      },
    })
    return quotas.quota_set
  }

  // TODO: getStorageStats(need to implement host first)
}

export default Cinder
