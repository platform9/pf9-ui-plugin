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

  // async setBootable (id) {
  //   const url = `${await this.volumesUrl()}/${id}`
  //   try {
  //     const volume = await axios.get(url, this.client.getAuthHeaders())
  //     const response = await axios.post(url, { 'os-set_bootable': { 'bootable': volume.bootable } }, this.client.getAuthHeaders())
  //     return response.data.volume
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

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
}

export default Volume
