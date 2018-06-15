import { gql } from 'apollo-boost'

export const GET_NETWORK = gql`
  query GetNetworkById($id: ID!){
    network(id: $id) {
      id
      name
      shared
      port_security_enabled
      external
      admin_state_up
    }
  }
`

export const GET_NETWORKS = gql`
  {
    networks {
      id
      name
      subnets
      tenant
      shared
      port_security_enabled
      external
      admin_state_up
      status
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
    createNetwork(input: $input) { id name subnets tenant admin_state_up port_security_enabled shared external status}
  }
`

export const UPDATE_NETWORK = gql`
  mutation UpdateNetwork($id: ID!, $input: UpdateNetworkInput!){
    updateNetwork(id: $id, input: $input) { id name admin_state_up port_security_enabled shared external}
  }
`
