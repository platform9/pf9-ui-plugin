/* eslint-disable camelcase */
import axios from 'axios'

class Cinder {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.cinderv3.admin.url
    return endpoint
  }

  volumesUrl = async () => `${await this.endpoint()}/volumes`

  async setRegionUrls () {
    const services = (await this.client.keystone.getServiceCatalog()).find(
      x => x.name === 'cinderv3').endpoints
    const baseUrlsByRegion = services.reduce((accum, service) => {
      accum[service.region] = service.url
      return accum
    }, {})
    return baseUrlsByRegion
  }

  async getVolume (id) {
    const url = `${await this.volumesUrl()}/${id}`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.volume
  }

  // Get volumes with details
  async getVolumes () {
    const url = `${await this.volumesUrl()}/detail`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.volumes
  }

  async getAllVolumes () {
    const url = `${await this.volumesUrl()}/detail?all_tenants=1`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.volumes
  }

  async getAllVolumesCount (limit, allTenants, markerId) {
    const baseUrl = `${await this.volumesUrl()}/detail`
    const limitUrl = `?limit=${limit}`
    const projectUrl = allTenants ? '&all_tenants=1' : ''
    const markerUrl = markerId ? `&marker=${markerId}` : ''
    const url = baseUrl + limitUrl + projectUrl + markerUrl
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.volumes
  }

  async createVolume (params) {
    const url = await this.volumesUrl()
    const response = await axios.post(url, { volume: params }, this.client.getAuthHeaders())
    return response.data.volume
  }

  async deleteVolume (id) {
    const url = `${await this.volumesUrl()}/${id}`
    const response = await axios.delete(url, this.client.getAuthHeaders())
    return response
  }

  async updateVolume (id, params) {
    const url = `${await this.volumesUrl()}/${id}`
    const response = await axios.put(url, { volume: params }, this.client.getAuthHeaders())
    return response.data.volume
  }

  async setBootable (id, bool) {
    const url = `${await this.volumesUrl()}/${id}/action`
    const response = await axios.post(url, { 'os-set_bootable': { bootable: bool } }, this.client.getAuthHeaders())
    return response.data.volume
  }

  // TODO: Test case for extend function
  // TODO: Current API doesn't work on AWS. Need to implement check logic in test.
  async extendVolume (id, size) {
    const url = `${await this.volumesUrl()}/${id}/action`
    const response = await axios.post(url, { 'os-extend': { 'new-size': size } }, this.client.getAuthHeaders())
    return response.data.volume
  }

  // TODO: test case for reset function (Instance implement needed. Attach function needed?)
  async resetVolumeStatus (id) {
    const url = `${await this.volumesUrl()}/${id}/action`
    const response = await axios.post(url, {
      'os-reset_status': {
        status: 'available',
        attach_status: 'detached',
      },
    }, this.client.getAuthHeaders())
    return response.data.volume
  }

  // TODO: test case for upload function (Image implement needed)
  async uploadVolumeAsImage (id, image) {
    const url = `${await this.volumesUrl()}/${id}/action`
    const response = await axios.post(url, {
      'os-volume_upload_image': {
        container_format: 'bare',
        force: image.force,
        image_name: image.name,
        disk_format: image.diskFormat || 'raw',
      },
    }, this.client.getAuthHeaders())
    return response.data.volume
  }

  async getVolumeTypes () {
    const url = `${await this.endpoint()}/types`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.volume_types
  }

  async getVolumeType (name) {
    const url = `${await this.endpoint()}/types`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.volume_types.find(x => x.name === name)
  }

  async createVolumeType (params) {
    const url = `${await this.endpoint()}/types`
    await axios.post(url, { volume_type: params }, this.client.getAuthHeaders())
    return this.getVolumeType(params.name)
  }

  async deleteVolumeType (id) {
    const url = `${await this.endpoint()}/types/${id}`
    await axios.delete(url, this.client.getAuthHeaders())
  }

  async updateVolumeType (id, params, keysToDelete = []) {
    const url = `${await this.endpoint()}/types/${id}`
    const { extra_specs, ...rest } = params
    const baseResponse = await axios.put(url, { volume_type: rest }, this.client.getAuthHeaders())
    await axios.post(`${url}/extra_specs`, { extra_specs }, this.client.getAuthHeaders())
    keysToDelete.forEach(async key => {
      await axios.delete(`${url}/extra_specs/${key}`, this.client.getAuthHeaders())
    })
    return baseResponse.data
  }

  async unsetVolumeTypeTag (id, tag) {
    const url = `${await this.endpoint()}/types/${id}/extra_specs/${tag}`
    await axios.delete(url, this.client.getAuthHeaders())
  }

  async getSnapshots () {
    const url = `${await this.endpoint()}/snapshots/detail`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.snapshots
  }

  async getAllSnapshots () {
    const url = `${await this.endpoint()}/snapshots/detail?all_tenants=1`
    const response = await axios.get(url, this.client.getAuthHeaders())
    return response.data.snapshots
  }

  async snapshotVolume (params) {
    const url = `${await this.endpoint()}/snapshots`
    const response = await axios.post(url, { snapshot: params }, this.client.getAuthHeaders())
    return response.data.snapshot
  }

  async deleteSnapshot (id) {
    const url = `${await this.endpoint()}/snapshots/${id}`
    await axios.delete(url, this.client.getAuthHeaders())
  }

  async updateSnapshot (id, params) {
    const url = `${await this.endpoint()}/snapshots/${id}`
    const response = await axios.put(url, { snapshot: params }, this.client.getAuthHeaders())
    return response.data.snapshot
  }

  async updateSnapshotMetadata (id, params) {
    const url = `${await this.endpoint()}/snapshots/${id}/metadata`
    const response = await axios.put(url, { metadata: params }, this.client.getAuthHeaders())
    return response.data.metadata
  }

  async getDefaultQuotas () {
    const url = `${await this.endpoint()}/os-quota-class-sets/defaults`

    const quotas = await axios.get(url, this.client.getAuthHeaders())
    return quotas.data.quota_class_set
  }

  async getDefaultQuotasForRegion (region) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/os-quota-class-sets/defaults`
    const quotas = await axios.get(url, this.client.getAuthHeaders())
    return quotas.data.quota_class_set
  }

  async getQuotas (projectId) {
    const url = `${await this.endpoint()}/os-quota-sets/${projectId}?usage=true`
    const quota = await axios.get(url, this.client.getAuthHeaders())
    return quota.data.quota_set
  }

  async getQuotasForRegion (projectId, region) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/os-quota-sets/${projectId}?usage=true`
    const quota = await axios.get(url, this.client.getAuthHeaders())
    return quota.data.quota_set
  }

  async setQuotas (params, projectId) {
    const url = `${await this.endpoint()}/os-quota-sets/${projectId}`
    const quotas = await axios.put(url, { quota_set: params }, this.client.getAuthHeaders())
    return quotas.data.quota_set
  }

  async setQuotasForRegion (params, projectId, region) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/os-quota-sets/${projectId}`
    const quotas = await axios.put(url, { quota_set: params }, this.client.getAuthHeaders())
    return quotas.data.quota_set
  }

  // TODO: getStorageStats(need to implement host first)
}

export default Cinder
