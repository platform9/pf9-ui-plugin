import { gql } from 'apollo-boost'

export const GET_SSH_KEY = gql`
  query GetSshKeyById($id: ID!){
    sshKey(id: $id) {
      id
      name
      fingerprint
      public_key
    }
  }
`

export const GET_SSH_KEYS = gql`
  {
    sshKeys {
      id
      name
      fingerprint
      public_key
    }
  }
`

export const REMOVE_SSH_KEY = gql`
  mutation RemoveSshKey($id: ID!) {
    removeSshKey(id: $id)
  }
`

export const ADD_SSH_KEY = gql`
  mutation CreateSshKey($input: SshKeyInput!) {
    createSshKey(input: $input) { id name fingerprint public_key}
  }
`
