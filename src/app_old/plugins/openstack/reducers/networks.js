import {
  ADD_NETWORK,
  REMOVE_NETWORK,
  SET_NETWORKS,
} from '../actions/networks'

const initialState = {
  networksLoaded: false,
  networks: [],
}

const reducer = (state = initialState, action) => {
  const { type, payload } = action // eslint-disable-line no-unused-vars

  switch (type) {
    case ADD_NETWORK:
      return {
        ...state,
        networks: [...state.networks, payload]
      }

    case SET_NETWORKS:
      return {
        ...state,
        networks: payload,
        networksLoaded: true,
      }

    case REMOVE_NETWORK:
      return {
        ...state,
        networks: state.networks.filter(network => network.id !== payload)
      }

    default:
      return state
  }
}

export default reducer
