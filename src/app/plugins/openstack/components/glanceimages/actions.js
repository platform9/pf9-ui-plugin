import { gql } from 'apollo-boost'

export const GET_GLANCEIMAGE = gql`
  query GetGlanceImageById($id: ID!) {
    glanceImage(id: $id) {
      id
      name
      description
      visibility
      owner
      protected
      tags
    }
  }
`

export const GET_GLANCEIMAGES = gql`
  {
    glanceImages {
      id
      name
      description
      status
      owner
      visibility
      protected
      disk_format
      virtual_size
      size
      created_at
    }
  }
`
export const UPDATE_GLANCEIMAGE = gql`
  mutation Update_GlanceImage ($id: ID!, $input: GlanceImageInput!) {
    updateGlanceImage(id: $id, input: $input) { id name description owner visibility protected tags }
  }
`

export const REMOVE_GLANCEIMAGE = gql`
  mutation Remove_GlanceImage ($id: ID!) {
    removeGlanceImage(id: $id)
  }
`
