import http from '../../../util/http'

const baseUrl = async () => {
  return '/neutron/v2.0'
}

const authHttp = http.authenticated.openstack

const makeRequest = async (path, method, body) => {
  const _baseUrl = await baseUrl()
  const fullPath = `${_baseUrl}${path}`
  return body ? authHttp[method](fullPath, body) : authHttp[method](fullPath)
}

export const createNetwork = (network) => {
  const body = {
    network: {
      name: network.name,
    }
  }
  return makeRequest('/networks', 'post', body).then(json => json.network.id)
}

export const deleteNetwork = (networkId) => makeRequest(`/networks/${networkId}`, 'delete')

export const getNetworks = () => makeRequest('/networks', 'get').then(x => x.networks)
