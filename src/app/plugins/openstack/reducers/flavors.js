import {
  ADD_FLAVOR,
  REMOVE_FLAVOR,
  SET_FLAVORS,
} from '../actions/flavors'

const initialState = {
  flavorsLoaded: false,
  flavors: [],
}

const reducer = (state = initialState, action) => {
  const { type, payload } = action // eslint-disable-line no-unused-vars

  switch (type) {
    case ADD_FLAVOR:
      return {
        ...state,
        flavors: [...state.flavors, payload]
      }

    case SET_FLAVORS:
      return {
        ...state,
        flavors: payload,
        flavorsLoaded: true,
      }

    case REMOVE_FLAVOR:
      return {
        ...state,
        flavors: state.flavors.filter(flavor => flavor.id !== payload)
      }

    default:
      return state
  }
}

export default reducer
