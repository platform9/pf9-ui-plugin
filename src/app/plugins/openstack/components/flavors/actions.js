import { gql } from 'apollo-boost'

const commonFields = `
  name
  disk
  ram
  vcpus
  public
  tags
`

export const GET_FLAVOR = gql`
  query GetFlavor($id: ID!) {
    flavor(id: $id){
      id
      name
      tags
    }
  }
`

export const GET_FLAVORS = gql`
  {
    flavors {
      id
      ${commonFields}
    }
  }
`

export const REMOVE_FLAVOR = gql`
  mutation RemoveFlavor($id: ID!) {
    removeFlavor(id: $id)
  }
`

export const ADD_FLAVOR = gql`
  mutation CreateFlavor($input: FlavorInput!) {
    createFlavor(input: $input) { id ${commonFields} }
  }
`

export const UPDATE_FLAVOR = gql`
  mutation UpdateFlavor($id: ID!, $input: UpdateFlavorInput!) {
    updateFlavor(id: $id, input: $input) { id name tags }
  }
`
