import {
  createNetwork,
  deleteNetwork,
  getNetworks,
} from '../api/neutron'

export const ADD_NETWORK = 'ADD_NETWORK'
export const REMOVE_NETWORK = 'REMOVE_NETWORK'
export const SET_NETWORKS = 'SET_NETWORKS'

export const addNetwork = network => async dispatch => {
  const networkId = await createNetwork(network)

  // Get the id of the newly created network
  if (networkId) {
    network.id = networkId
    dispatch({ type: ADD_NETWORK, payload: network })
  } else {
    console.error('failed to add network')
  }
}

export const setNetworks = networks => ({ type: SET_NETWORKS, payload: networks })

export const fetchNetworks = () => async dispatch => {
  const networks = await getNetworks()
  dispatch(setNetworks(networks))
}

export const removeNetwork = networkId => async dispatch => {
  await deleteNetwork(networkId)
  dispatch({ type: REMOVE_NETWORK, payload: networkId })
}
