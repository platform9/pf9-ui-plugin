import {
  ADD_CLUSTER,
  REMOVE_CLUSTER,
  SET_CLUSTERS,
} from '../actions/clusters'

const initialState = {
  clustersLoaded: false,
  clusters: [],
}

const reducer = (state = initialState, action) => {
  const { type, payload } = action // eslint-disable-line no-unused-vars

  switch (type) {
    case ADD_CLUSTER:
      return {
        ...state,
        clusters: [...state.clusters, payload]
      }

    case SET_CLUSTERS:
      return {
        ...state,
        clusters: payload,
        clustersLoaded: true,
      }

    case REMOVE_CLUSTER:
      return {
        ...state,
        clusters: state.clusters.filter(cluster => cluster.id !== payload)
      }

    default:
      return state
  }
}

export default reducer
