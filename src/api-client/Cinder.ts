/* eslint-disable camelcase */
import ApiService from 'api-client/ApiService'

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
    const url = `/types`
    await this.client.basicPost<any>(this.getClassName(), 'createVolumeType', url, {
      volume_type: params,
    })
    return this.getVolumeType(params.name)
  }

  async deleteVolumeType(id) {
    const url = `/types/${id}`
    await this.client.basicDelete<any>(this.getClassName(), 'deleteVolumeType', url)
  }

  async updateVolumeType(id, params, keysToDelete = []) {
    const url = `/types/${id}`
    const { extra_specs: extraSpecs, ...rest } = params
    const baseResponse = await this.client.basicPut<any>(
      this.getClassName(),
      'updateVolumeType',
      url,
      {
        volume_type: rest,
      },
    )
    await this.client.basicPost<any>(
      this.getClassName(),
      'updateVolumeType/extra_specs',
      `${url}/extra_specs`,
      {
        extra_specs: extraSpecs,
      },
    )
    await Promise.all(
      keysToDelete.map(async (key) => {
        return this.client.basicDelete<any>(
          this.getClassName(),
          `updateVolumeType/extra_specs/${key}`,
          `${url}/extra_specs/${key}`,
        )
      }),
    )
    return baseResponse
  }

  async unsetVolumeTypeTag(id, tag) {
    const url = `/types/${id}/extra_specs/${tag}`
    await this.client.basicDelete<any>(this.getClassName(), 'unsetVolumeTypeTag', url)
  }

  async getSnapshots() {
    const url = `/snapshots/detail`
    const response = await this.client.basicGet<any>(this.getClassName(), 'getSnapshots', url)
    return response.snapshots
  }

  async getAllSnapshots() {
    const url = `/snapshots/detail?all_tenants=1`
    const response = await this.client.basicGet<any>(this.getClassName(), 'getAllSnapshots', url)
    return response.snapshots
  }

  async snapshotVolume(params) {
    const url = `/snapshots`
    const response = await this.client.basicPost<any>(this.getClassName(), 'snapshotVolume', url, {
      snapshot: params,
    })
    return response.snapshot
  }

  async deleteSnapshot(id) {
    const url = `/snapshots/${id}`
    await this.client.basicDelete<any>(this.getClassName(), 'deleteSnapshot', url)
  }

  async updateSnapshot(id, params) {
    const url = `/snapshots/${id}`
    const response = await this.client.basicPut<any>(this.getClassName(), 'updateSnapshot', url, {
      snapshot: params,
    })
    return response.snapshot
  }

  async updateSnapshotMetadata(id, params) {
    const url = `/snapshots/${id}/metadata`
    const response = await this.client.basicPut<any>(
      this.getClassName(),
      'updateSnapshotMetadata',
      url,
      {
        metadata: params,
      },
    )
    return response.metadata
  }

  async getDefaultQuotas() {
    const url = `/os-quota-class-sets/defaults`

    const quotas = await this.client.basicGet<any>(this.getClassName(), 'getDefaultQuotas', url)
    return quotas.quota_class_set
  }

  async getDefaultQuotasForRegion(region) {
    const urls = await this.getRegionUrls()
    const url = `${urls[region]}/os-quota-class-sets/defaults`
    const quotas = await this.client.basicGet<any>(
      this.getClassName(),
      'getDefaultQuotasForRegion',
      url,
    )
    return quotas.quota_class_set
  }

  async getQuotas(projectId) {
    const url = `/os-quota-sets/${projectId}?usage=true`
    const quota = await this.client.basicGet<any>(this.getClassName(), 'getQuotas', url)
    return quota.quota_set
  }

  async getQuotasForRegion(projectId, region) {
    const urls = await this.getRegionUrls()
    const url = `${urls[region]}/os-quota-sets/${projectId}?usage=true`
    const quota = await this.client.basicGet<any>(this.getClassName(), 'getQuotasForRegion', url)
    return quota.quota_set
  }

  async setQuotas(params, projectId) {
    const url = `/os-quota-sets/${projectId}`
    const quotas = await this.client.basicPut<any>(this.getClassName(), 'setQuotas', url, {
      quota_set: params,
    })
    return quotas.quota_set
  }

  async setQuotasForRegion(params, projectId, region) {
    const urls = await this.getRegionUrls()
    const url = `${urls[region]}/os-quota-sets/${projectId}`
    const quotas = await this.client.basicPut<any>(this.getClassName(), 'setQuotasForRegion', url, {
      quota_set: params,
    })
    return quotas.quota_set
  }

  // TODO: getStorageStats(need to implement host first)
}

export default Cinder
