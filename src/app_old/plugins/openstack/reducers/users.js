import {
  ADD_USER,
  REMOVE_USER,
  SET_USERS,
} from '../actions/users'

const initialState = {
  usersLoaded: false,
  users: [],
}

const reducer = (state = initialState, action) => {
  const { type, payload } = action // eslint-disable-line no-unused-vars

  switch (type) {
    case ADD_USER:
      return {
        ...state,
        users: [...state.users, payload]
      }

    case SET_USERS:
      return {
        ...state,
        users: payload,
        usersLoaded: true,
      }

    case REMOVE_USER:
      return {
        ...state,
        users: state.users.filter(user => user.id !== payload)
      }

    default:
      return state
  }
}

export default reducer
