import { gql } from 'apollo-boost'

const commonFields = `
  name
  author
  tenant
  public
  description
`

export const GET_APPLICATION = gql`
  query GetApplication($id: ID!) {
    application(id: $id) {
      id
      ${commonFields}
    }
  }
`

export const GET_APPLICATIONS = gql`
  {
    applications {
      id
      ${commonFields}
    }
  }
`

export const REMOVE_APPLICATION = gql`
  mutation RemoveApplication($id: ID!) {
    removeFlavor(id: $id)
  }
`

export const ADD_APPLICATION = gql`
  mutation CreateApplication($input: ApplicationInput!) {
    createApplication(input: $input) {
      id
      ${commonFields}
    }
  } 
`

export const UPDATE_APPLICATION = gql`
  mutation UpdateApplication($id: ID!, $inut: UpdateApplicationInput!) {
    updateApplication(id: $id, input: $input) {
      id
      ${commonFields}
    }
  }
`
