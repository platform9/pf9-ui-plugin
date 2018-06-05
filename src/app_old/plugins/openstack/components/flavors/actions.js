import { gql } from 'apollo-boost'

const commonFields = `
  name
  disk
  ram
  vcpus
  public
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
  mutation UpdateFlavor($id: ID!, $input: FlavorInput!) {
    updateFlavor(id: $id, input: $input) { id ${commonFields} }
  }
`
