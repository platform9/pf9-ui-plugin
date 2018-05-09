import http from '../../../util/http'

const v2Base = '/neutron/v2.0'
const authHttp = http.authenticated.openstack

export const createNetwork = (network) => {
  const body = {
    network: {
      name: network.name,
    }
  }
  return authHttp.post(`${v2Base}/networks`, body).then(json => json.network.id)
}

export const deleteNetwork = (networkId) => authHttp.delete(`${v2Base}/networks/${networkId}`)

export const getNetworks = () => authHttp.get(`${v2Base}/networks`).then(x => x.networks)
