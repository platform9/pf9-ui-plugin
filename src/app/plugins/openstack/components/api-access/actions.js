import { gql } from 'apollo-boost'

export const GET_CATALOG = gql`
  {
    serviceCatalog {
      id
      type
      name
      endpoints {
        id
        interface
        region
        url
      }
    }
  }
`
