/* eslint-disable camelcase */
import ApiService from 'api-client/ApiService'

class Cinder extends ApiService {
  clsName = 'cinder'
  endpoint = async () => {
    return this.client.keystone.getServiceEndpoint('cinderv3', 'admin')
  }

  volumesUrl = async () => `${await this.endpoint()}/volumes`

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
    const url = `${await this.volumesUrl()}/${id}`
    const response = await this.client.basicGet<any>('Cinder', 'getVolume', url)
    return response.volume
  }

  // Get volumes with details
  async getVolumes() {
    const url = `${await this.volumesUrl()}/detail`
    const response = await this.client.basicGet<any>('Cinder', 'getVolumes', url)
    return response.volumes
  }

  async getAllVolumes() {
    const url = `${await this.volumesUrl()}/detail?all_tenants=1`
    const response = await this.client.basicGet<any>('Cinder', 'getAllVolumes', url)
    return response.volumes
  }

  async getAllVolumesCount(limit, allTenants, markerId) {
    const baseUrl = `${await this.volumesUrl()}/detail`
    const limitUrl = `?limit=${limit}`
    const projectUrl = allTenants ? '&all_tenants=1' : ''
    const markerUrl = markerId ? `&marker=${markerId}` : ''
    const url = baseUrl + limitUrl + projectUrl + markerUrl
    const response = await this.client.basicGet<any>('Cinder', 'getAllVolumesCount', url)
    return response.volumes
  }

  async createVolume(params) {
    const url = await this.volumesUrl()
    const response = await this.client.basicPost<any>('Cinder', 'getAllVolumesCount', url, {
      volume: params,
    })
    return response.volume
  }

  async deleteVolume(id) {
    const url = `${await this.volumesUrl()}/${id}`
    return this.client.basicDelete<any>('Cinder', 'deleteVolume', url)
  }

  async updateVolume(id, params) {
    const url = `${await this.volumesUrl()}/${id}`
    const response = await this.client.basicPut<any>('Cinder', 'updateVolume', url, {
      volume: params,
    })
    return response.volume
  }

  async setBootable(id, bool) {
    const url = `${await this.volumesUrl()}/${id}/action`
    const response = await this.client.basicPost<any>('Cinder', 'setBootable', url, {
      'os-set_bootable': { bootable: bool },
    })
    return response.volume
  }

  // TODO: Test case for extend function
  // TODO: Current API doesn't work on AWS. Need to implement check logic in test.
  async extendVolume(id, size) {
    const url = `${await this.volumesUrl()}/${id}/action`
    const response = await this.client.basicPost<any>('Cinder', 'extendVolume', url, {
      'os-extend': { 'new-size': size },
    })
    return response.volume
  }

  // TODO: test case for reset function (Instance implement needed. Attach function needed?)
  async resetVolumeStatus(id) {
    const url = `${await this.volumesUrl()}/${id}/action`
    const response = await this.client.basicPost<any>('Cinder', 'resetVolumeStatus', url, {
      'os-reset_status': {
        status: 'available',
        attach_status: 'detached',
      },
    })
    return response.volume
  }

  // TODO: test case for upload function (Image implement needed)
  async uploadVolumeAsImage(id, image) {
    const url = `${await this.volumesUrl()}/${id}/action`
    const response = await this.client.basicPost<any>('Cinder', 'uploadVolumeAsImage', url, {
      'os-volume_upload_image': {
        container_format: 'bare',
        force: image.force,
        image_name: image.name,
        disk_format: image.diskFormat || 'raw',
      },
    })
    return response.volume
  }

  async getVolumeTypes() {
    const url = `${await this.endpoint()}/types`
    const response = await this.client.basicGet<any>('Cinder', 'getVolumeTypes', url)
    return response.volume_types
  }

  async getVolumeType(name) {
    const url = `${await this.endpoint()}/types`
    const response = await this.client.basicGet<any>('Cinder', 'getVolumeType', url)
    return response.volume_types.find((x) => x.name === name)
  }

  async createVolumeType(params) {
    const url = `${await this.endpoint()}/types`
    await this.client.basicPost<any>('Cinder', 'createVolumeType', url, { volume_type: params })
    return this.getVolumeType(params.name)
  }

  async deleteVolumeType(id) {
    const url = `${await this.endpoint()}/types/${id}`
    await this.client.basicDelete<any>('Cinder', 'deleteVolumeType', url)
  }

  async updateVolumeType(id, params, keysToDelete = []) {
    const url = `${await this.endpoint()}/types/${id}`
    const { extra_specs: extraSpecs, ...rest } = params
    const baseResponse = await this.client.basicPut<any>('Cinder', 'updateVolumeType', url, {
      volume_type: rest,
    })
    await this.client.basicPost<any>(
      'Cinder',
      'updateVolumeType/extra_specs',
      `${url}/extra_specs`,
      {
        extra_specs: extraSpecs,
      },
    )
    await Promise.all(
      keysToDelete.map(async (key) => {
        return this.client.basicDelete<any>(
          'Cinder',
          `updateVolumeType/extra_specs/${key}`,
          `${url}/extra_specs/${key}`,
        )
      }),
    )
    return baseResponse
  }

  async unsetVolumeTypeTag(id, tag) {
    const url = `${await this.endpoint()}/types/${id}/extra_specs/${tag}`
    await this.client.basicDelete<any>('Cinder', 'unsetVolumeTypeTag', url)
  }

  async getSnapshots() {
    const url = `${await this.endpoint()}/snapshots/detail`
    const response = await this.client.basicGet<any>('Cinder', 'getSnapshots', url)
    return response.snapshots
  }

  async getAllSnapshots() {
    const url = `${await this.endpoint()}/snapshots/detail?all_tenants=1`
    const response = await this.client.basicGet<any>('Cinder', 'getAllSnapshots', url)
    return response.snapshots
  }

  async snapshotVolume(params) {
    const url = `${await this.endpoint()}/snapshots`
    const response = await this.client.basicPost<any>('Cinder', 'snapshotVolume', url, {
      snapshot: params,
    })
    return response.snapshot
  }

  async deleteSnapshot(id) {
    const url = `${await this.endpoint()}/snapshots/${id}`
    await this.client.basicDelete<any>('Cinder', 'deleteSnapshot', url)
  }

  async updateSnapshot(id, params) {
    const url = `${await this.endpoint()}/snapshots/${id}`
    const response = await this.client.basicPut<any>('Cinder', 'updateSnapshot', url, {
      snapshot: params,
    })
    return response.snapshot
  }

  async updateSnapshotMetadata(id, params) {
    const url = `${await this.endpoint()}/snapshots/${id}/metadata`
    const response = await this.client.basicPut<any>('Cinder', 'updateSnapshotMetadata', url, {
      metadata: params,
    })
    return response.metadata
  }

  async getDefaultQuotas() {
    const url = `${await this.endpoint()}/os-quota-class-sets/defaults`

    const quotas = await this.client.basicGet<any>('Cinder', 'getDefaultQuotas', url)
    return quotas.quota_class_set
  }

  async getDefaultQuotasForRegion(region) {
    const urls = await this.getRegionUrls()
    const url = `${urls[region]}/os-quota-class-sets/defaults`
    const quotas = await this.client.basicGet<any>('Cinder', 'getDefaultQuotasForRegion', url)
    return quotas.quota_class_set
  }

  async getQuotas(projectId) {
    const url = `${await this.endpoint()}/os-quota-sets/${projectId}?usage=true`
    const quota = await this.client.basicGet<any>('Cinder', 'getQuotas', url)
    return quota.quota_set
  }

  async getQuotasForRegion(projectId, region) {
    const urls = await this.getRegionUrls()
    const url = `${urls[region]}/os-quota-sets/${projectId}?usage=true`
    const quota = await this.client.basicGet<any>('Cinder', 'getQuotasForRegion', url)
    return quota.quota_set
  }

  async setQuotas(params, projectId) {
    const url = `${await this.endpoint()}/os-quota-sets/${projectId}`
    const quotas = await this.client.basicPut<any>('Cinder', 'setQuotas', url, {
      quota_set: params,
    })
    return quotas.quota_set
  }

  async setQuotasForRegion(params, projectId, region) {
    const urls = await this.getRegionUrls()
    const url = `${urls[region]}/os-quota-sets/${projectId}`
    const quotas = await this.client.basicPut<any>('Cinder', 'setQuotasForRegion', url, {
      quota_set: params,
    })
    return quotas.quota_set
  }

  // TODO: getStorageStats(need to implement host first)
}

export default Cinder
