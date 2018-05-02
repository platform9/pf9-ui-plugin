import {
  createFlavor,
  deleteFlavor,
  getFlavors,
} from '../api/nova'

export const ADD_FLAVOR = 'ADD_FLAVOR'
export const REMOVE_FLAVOR = 'REMOVE_FLAVOR'
export const SET_FLAVORS = 'SET_FLAVORS'

export const addFlavor = flavor => async dispatch => {
  const flavorId = await createFlavor(flavor)

  // Get the id of the newly created flavor
  if (flavorId) {
    flavor.id = flavorId
    dispatch({ type: ADD_FLAVOR, payload: flavor })
  } else {
    alert ('failed to add flavor')
  }
}

export const setFlavors = flavors => ({ type: SET_FLAVORS, payload: flavors })

export const fetchFlavors = () => async dispatch => {
  const flavors = await getFlavors()
  dispatch(setFlavors(flavors))
}

export const removeFlavor = flavorId => async dispatch => {
  await deleteFlavor(flavorId)
  dispatch({ type: REMOVE_FLAVOR, payload: flavorId })
}
