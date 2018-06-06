import { gql } from 'apollo-boost'

export const GET_VOLUMES = gql`
  {
    volumes {
      id
      name
      description
      type
      status
      metadata
      size
      sizeUnit
      bootable
      tenant
      source
      host
      instance
      device
      created
      attachedMode
      readonly
    }
  }
`

export const REMOVE_VOLUME = gql`
  mutation RemoveVolume($id: ID!) {
    removeVolume(id: $id)
  }
`

export const ADD_VOLUME = gql`
  mutation CreateVolume($input: VolumeInput!) {
    createVolume(input: $input) { id name description }
  }
`

export const UPDATE_VOLUME= gql`
  mutation UpdateVolume($id: ID!, $input: VolumeInput!) {
    updateVolume(id: $id, input: $input) { id name }
  }
`
