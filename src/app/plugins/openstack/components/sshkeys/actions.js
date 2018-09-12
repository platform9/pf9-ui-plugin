import { gql } from 'apollo-boost'

export const GET_SSH_KEY = gql`
  query GetSshKeyByName($id: String!){
    sshKey(name: $id) {
      name
      fingerprint
      public_key
    }
  }
`

export const GET_SSH_KEYS = gql`
  {
    sshKeys {
      name
      fingerprint
      public_key
    }
  }
`

export const REMOVE_SSH_KEY = gql`
  mutation RemoveSshKey($id: String!) {
    removeSshKey(name: $id)
  }
`

export const ADD_SSH_KEY = gql`
  mutation CreateSshKey($input: SshKeyInput!) {
    createSshKey(input: $input) { name fingerprint public_key}
  }
`
