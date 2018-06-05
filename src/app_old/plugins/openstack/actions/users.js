import {
  createUser,
  deleteUser,
  getUsers,
} from '../api/keystone'

export const ADD_USER = 'ADD_USER'
export const REMOVE_USER = 'REMOVE_USER'
export const SET_USERS = 'SET_USERS'

export const addUser = user => async dispatch => {
  const userId = await createUser(user)

  // Get the id of the newly created user
  if (userId) {
    user.id = userId
    dispatch({ type: ADD_USER, payload: user })
  }
}

export const setUsers = users => ({ type: SET_USERS, payload: users })

export const fetchUsers = () => async dispatch => {
  const users = await getUsers()
  dispatch(setUsers(users))
}

export const removeUser = userId => async dispatch => {
  await deleteUser(userId)
  dispatch({ type: REMOVE_USER, payload: userId })
}
