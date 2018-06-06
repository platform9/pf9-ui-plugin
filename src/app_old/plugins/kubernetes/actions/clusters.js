import {
  createCluster,
  deleteCluster,
  // getClusters,
} from '../api/qbert'

export const ADD_CLUSTER = 'ADD_CLUSTER'
export const REMOVE_CLUSTER = 'REMOVE_CLUSTER'
export const SET_CLUSTERS = 'SET_CLUSTERS'

export const addCluster = cluster => async dispatch => {
  const clusterId = await createCluster(cluster)

  // Get the id of the newly created cluster
  if (clusterId) {
    cluster.id = clusterId
    dispatch({ type: ADD_CLUSTER, payload: cluster })
  } else {
    console.error('failed to add cluster')
  }
}

export const setClusters = clusters => ({ type: SET_CLUSTERS, payload: clusters })

export const fetchClusters = () => async dispatch => {
  // const clusters = await getClusters()
  const clusters = []
  dispatch(setClusters(clusters))
}

export const removeCluster = clusterId => async dispatch => {
  await deleteCluster(clusterId)
  dispatch({ type: REMOVE_CLUSTER, payload: clusterId })
}
