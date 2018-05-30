import { gql } from 'apollo-boost'

export const GET_USERS = gql`
  {
    users {
      id
      username
      displayname
      name
      email
    }
  }
`

export const REMOVE_USER = gql`
  mutation RemoveUser($id: ID!) {
    removeUser(id: $id)
  }
`

export const ADD_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) { id username displayname name email }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) { id username }
  }
`
