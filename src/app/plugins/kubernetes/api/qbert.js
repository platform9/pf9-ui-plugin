import http from '../../../util/http'

const v2Base = '/qbert/v2'
const authHttp = http.authenticated.openstack

export const createCluster = (cluster, tenantId) => {
  const body = {
    name: cluster.name,
  }
  return authHttp.post(`${v2Base}/${tenantId}/clusters`, body).then(json => json.cluster.id)
}

export const deleteCluster = (clusterId, tenantId) => authHttp.delete(`${v2Base}/${tenantId}/${clusterId}`)

export const getClusters = (tenantId) => authHttp.get(`${v2Base}/${tenantId}/clusters`)
