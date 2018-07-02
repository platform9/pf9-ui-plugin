import { gql } from 'apollo-boost'

export const GET_ROUTER = gql`
  query GetRouterById($id: ID!){
    router(id: $id) {
      id
      name
      admin_state_up
    }
  }
`

export const GET_ROUTERS = gql`
  {
    routers {
      id
      tenant_id
      name
      admin_state_up
      status
    }
  }
`

export const REMOVE_ROUTER = gql`
  mutation RemoveRouter($id: ID!) {
    removeRouter(id: $id)
  }
`

export const ADD_ROUTER = gql`
  mutation CreateRouter($input: RouterInput!) {
    createRouter(input: $input) { id name tenant_id admin_state_up status}
  }
`

export const UPDATE_ROUTER = gql`
  mutation UpdateRouter($id: ID!, $input: UpdateRouterInput!){
    updateRouter(id: $id, input: $input) { id name tenant_id admin_state_up status}
  }
`
