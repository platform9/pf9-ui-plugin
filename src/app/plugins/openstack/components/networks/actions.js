import { gql } from 'apollo-boost'

export const GET_NETWORKS = gql`
  {
    networks {
      id
      name
    }
  }
`

export const REMOVE_NETWORK = gql`
  mutation RemoveNetwork($id: ID!) {
    removeNetwork(id: $id)
  }
`

export const ADD_NETWORK = gql`
  mutation CreateNetwork($input: NetworkInput!) {
    createNetwork(input: $input) { id name }
  }
`
