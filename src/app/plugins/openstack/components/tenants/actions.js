import { gql } from 'apollo-boost'

export const GET_TENANTS = gql`
  {
    tenants {
      id
      name
      description
    }
  }
`

export const REMOVE_TENANT = gql`
  mutation removeTenant($id: ID) {
    removeTenant(id: $id)
  }
`
