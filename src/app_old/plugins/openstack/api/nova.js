import http from '../../../util/http'

const v2Base = '/nova/v2.1'
const authHttp = http.authenticated.openstack

export const createFlavor = (flavor, tenantId) => {
  const body = {
    flavor: {
      name: flavor.name,
      ram: 1024,
      vcpus: 2,
      disk: 10,
    }
  }
  return authHttp.post(`${v2Base}/${tenantId}/flavors`, body).then(json => json.flavor.id)
}

export const deleteFlavor = (flavorId, tenantId) => authHttp.delete(`${v2Base}/${tenantId}/${flavorId}`)

export const getFlavors = (tenantId) => authHttp.get(`${v2Base}/${tenantId}/flavors/detail`).then(x => x.flavors)
