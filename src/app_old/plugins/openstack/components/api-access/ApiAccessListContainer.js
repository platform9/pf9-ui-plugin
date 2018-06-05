import React from 'react'
import { withRouter } from 'react-router-dom'
import { Query } from 'react-apollo'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import gql from 'graphql-tag'

import Loader from 'core/common/Loader'
import DisplayError from 'core/common/DisplayError'
import ApiAccessList from './ApiAccessList'

const GET_CATALOG = gql`
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

@requiresAuthentication
@withRouter
// @connect(mapStateToProps)
class ApiAccessListContainer extends React.Component {
  state = {
    showConfirmation: false,
  }

  render () {
    const { catalog } = this.props

    return (
      <div>
        <ApiAccessList
          catalog={catalog}
        />
      </div>
    )
  }
}

const GraphqlCrudContainer = ({ query, actions, children, ...props }) => {
  return (
    <Query query={query}>
      {({ loading, error, data, client }) => {
        if (loading) { return <Loader /> }
        if (error) { return <DisplayError error={error} /> }
        return children({ data, client, actions: {} })
      }}
    </Query>
  )
}

const GraphqlApiAccessList = () => (
  <GraphqlCrudContainer query={GET_CATALOG}>
    {({ data, actions }) => (
      <ApiAccessListContainer catalog={data.serviceCatalog} />
    )}
  </GraphqlCrudContainer>
)

export default GraphqlApiAccessList
