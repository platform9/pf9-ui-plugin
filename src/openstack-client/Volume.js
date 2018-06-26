import axios from 'axios'

class Volume {
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
    const services = (await this.client.keystone.getServiceCatalog()).find(x => x.name === 'cinderv3').endpoints
    let baseUrlsByRegion = {}
    for (let service of services) {
      baseUrlsByRegion[service.region] = service.url
    }
    return baseUrlsByRegion
  }

  async getVolume (id) {
    const url = `${await this.volumesUrl()}/${id}`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.volume
    } catch (err) {
      console.log(err)
    }
  }

  // Get volumes with details
  async getVolumes () {
    const url = `${await this.volumesUrl()}/detail`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.volumes
    } catch (err) {
      console.log(err)
    }
  }

  async getAllVolumes () {
    const url = `${await this.volumesUrl()}/detail?all_tenants=1`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.volumes
    } catch (err) {
      console.log(err)
    }
  }

  async getAllVolumesCount (limit, allTenants, markerId) {
    let url = `${await this.volumesUrl()}/detail`
    if (allTenants) {
      if (markerId) {
        url += `?all_tenants=1&limit=${limit}&marker=${markerId}`
      } else {
        url += `?all_tenants=1&limit=${limit}`
      }
    } else {
      if (markerId) {
        url += `?limit=${limit}&marker=${markerId}`
      } else {
        url += `?limit=${limit}`
      }
    }
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.volumes
    } catch (err) {
      console.log(err)
    }
  }

  async createVolume (params) {
    const url = await this.volumesUrl()
    try {
      const response = await axios.post(url, { volume: params }, this.client.getAuthHeaders())
      return response.data.volume
    } catch (err) {
      console.log(err)
    }
  }

  async deleteVolume (id) {
    const url = `${await this.volumesUrl()}/${id}`
    try {
      const response = await axios.delete(url, this.client.getAuthHeaders())
      return response
    } catch (err) {
      console.log(err)
    }
  }

  async updateVolume (id, params) {
    const url = `${await this.volumesUrl()}/${id}`
    try {
      const response = await axios.put(url, { volume: params }, this.client.getAuthHeaders())
      return response.data.volume
    } catch (err) {
      console.log(err)
    }
  }

  async setBootable (id, bool) {
    const url = `${await this.volumesUrl()}/${id}/action`
    try {
      const response = await axios.post(url, { 'os-set_bootable': { 'bootable': bool } }, this.client.getAuthHeaders())
      return response.data.volume
    } catch (err) {
      console.log(err)
    }
  }

  // TODO: test case for extend function (API is currently down)
  async extendVolume (id, size) {
    const url = `${await this.volumesUrl()}/${id}/action`
    try {
      const response = await axios.post(url, { 'os-extend': { 'new-size': size } }, this.client.getAuthHeaders())
      return response.data.volume
    } catch (err) {
      console.log(err)
    }
  }

  // TODO: test case for reset function (Attach function needed?)
  async resetVolumeStatus (id) {
    const url = `${await this.volumesUrl()}/${id}/action`
    try {
      const response = await axios.post(url, { 'os-reset_status': {
        'status': 'available',
        'attach_status': 'detached'
      } }, this.client.getAuthHeaders())
      return response.data.volume
    } catch (err) {
      console.log(err)
    }
  }

  // TODO: test case for upload function (Image implement needed)
  async uploadVolumeAsImage (id, image) {
    const url = `${await this.volumesUrl()}/${id}/action`
    try {
      const response = await axios.post(url, { 'os-volume_upload_image': {
        'container_format': 'bare',
        'force': image.force,
        'image_name': image.name,
        'disk_format': image.diskFormat || 'raw'
      } }, this.client.getAuthHeaders())
      return response.data.volume
    } catch (err) {
      console.log(err)
    }
  }

  async getVolumeTypes () {
    const url = `${await this.endpoint()}/types`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.volume_types
    } catch (err) {
      console.log(err)
    }
  }

  async getVolumeType (name) {
    const url = `${await this.endpoint()}/types`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.volume_types.find(x => x.name === name)
    } catch (err) {
      console.log(err)
    }
  }

  async createVolumeType (params) {
    const url = `${await this.endpoint()}/types`
    try {
      await axios.post(url, { volume_type: params }, this.client.getAuthHeaders())
      return this.getVolumeType(params.name)
    } catch (err) {
      console.log(err)
    }
  }

  async deleteVolumeType (id) {
    const url = `${await this.endpoint()}/types/${id}`
    try {
      await axios.delete(url, this.client.getAuthHeaders())
    } catch (err) {
      console.log(err)
    }
  }

  async updateVolumeType (id, params) {
    const url = `${await this.endpoint()}/types/${id}/extra_specs`
    try {
      const response = await axios.post(url, { extra_specs: params }, this.client.getAuthHeaders())
      return response.data.extra_specs
    } catch (err) {
      console.log(err)
    }
  }

  async unsetVolumeTypeTag (id, tag) {
    const url = `${await this.endpoint()}/types/${id}/extra_specs/${tag}`
    try {
      await axios.delete(url, this.client.getAuthHeaders())
    } catch (err) {
      console.log(err)
    }
  }

  async getSnapshots () {
    const url = `${await this.endpoint()}/snapshots/detail`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.snapshots
    } catch (err) {
      console.log(err)
    }
  }

  async getAllSnapshots () {
    const url = `${await this.endpoint()}/snapshots/detail?all_tenants=1`
    try {
      const response = await axios.get(url, this.client.getAuthHeaders())
      return response.data.snapshots
    } catch (err) {
      console.log(err)
    }
  }

  async snapshotVolume (params) {
    const url = `${await this.endpoint()}/snapshots`
    try {
      const response = await axios.post(url, { snapshot: params }, this.client.getAuthHeaders())
      return response.data.snapshot
    } catch (err) {
      console.log(err)
    }
  }

  async deleteSnapshot (id) {
    const url = `${await this.endpoint()}/snapshots/${id}`
    try {
      await axios.delete(url, this.client.getAuthHeaders())
    } catch (err) {
      console.log(err)
    }
  }

  async updateSnapshot (id, params) {
    const url = `${await this.endpoint()}/snapshots/${id}`
    try {
      const response = await axios.put(url, { snapshot: params }, this.client.getAuthHeaders())
      return response.data.snapshot
    } catch (err) {
      console.log(err)
    }
  }

  async updateSnapshotMetadata (id, params) {
    const url = `${await this.endpoint()}/snapshots/${id}/metadata`
    try {
      const response = await axios.put(url, { metadata: params }, this.client.getAuthHeaders())
      return response.data.metadata
    } catch (err) {
      console.log(err)
    }
  }

  async getDefaultQuotas () {
    const url = `${await this.endpoint()}/os-quota-class-sets/defaults`
    try {

    } catch (err) {
      console.log(err)
    }
    const quotas = await axios.get(url, this.client.getAuthHeaders())
    return quotas.data.quota_class_set
  }

  async getDefaultQuotasForRegion (region) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/os-quota-class-sets/defaults`
    try {
      const quotas = await axios.get(url, this.client.getAuthHeaders())
      return quotas.data.quota_class_set
    } catch (err) {
      console.log(err)
    }
  }

  async getQuotas (projectId) {
    const url = `${await this.endpoint()}/os-quota-sets/${projectId}?usage=true`
    try {
      const quota = await axios.get(url, this.client.getAuthHeaders())
      return quota.data.quota_set
    } catch (err) {
      console.log(err)
    }
  }

  async getQuotasForRegion (projectId, region) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/os-quota-sets/${projectId}?usage=true`
    try {
      const quota = await axios.get(url, this.client.getAuthHeaders())
      return quota.data.quota_set
    } catch (err) {
      console.log(err)
    }
  }

  async setQuotas (params, projectId) {
    const url = `${await this.endpoint()}/os-quota-sets/${projectId}`
    try {
      const quotas = await axios.put(url, { quota_set: params }, this.client.getAuthHeaders())
      return quotas.data.quota_set
    } catch (err) {
      console.log(err)
    }
  }

  async setQuotasForRegion (params, projectId, region) {
    const urls = await this.setRegionUrls()
    const url = `${urls[region]}/os-quota-sets/${projectId}`
    try {
      const quotas = await axios.put(url, {quota_set: params}, this.client.getAuthHeaders())
      return quotas.data.quota_set
    } catch (err) {
      console.log(err)
    }
  }

  // TODO: getStorageStats(needs host implement first)
}

export default Volume
