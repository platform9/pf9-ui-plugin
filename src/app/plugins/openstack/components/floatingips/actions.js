import { gql } from 'apollo-boost'

export const GET_FLOATING_IP = gql`
  query GetFloatingIpById($id: ID!){
    floatingIp(id: $id) {
      id
      floating_ip_address
      subnet_id
      port_id
      project_id
      tenant_id
      fixed_ip_address
      description
      floating_network_id
      status
      router_id
    }
  }
`

export const GET_FLOATING_IPS = gql`
  {
    floatingIps {
      id
      floating_ip_address
      subnet_id
      port_id
      project_id
      tenant_id
      fixed_ip_address
      description
      floating_network_id
      status
      router_id
    }
  }
`

export const REMOVE_FLOATING_IP = gql`
  mutation RemoveFloatingIp($id: ID) {
    removeFloatingIp(id: $id)
  }
`

export const ADD_FLOATING_IP = gql`
  mutation CreateFloatingIp($input: FloatingIpInput!) {
    createFloatingIp(input: $input) { id floating_ip_address subnet_id port_id project_id tenant_id fixed_ip_address description floating_network_id status router_id}
  }
`

export const UPDATE_FLOATING_IP = gql`
  mutation UpdateFloatingIp($id: ID!, $input: UpdateFloatingIpInput!){
    updateFloatingIp(id: $id, input: $input) { id floating_ip_address subnet_id port_id project_id tenant_id fixed_ip_address description floating_network_id status router_id}
  }
`
