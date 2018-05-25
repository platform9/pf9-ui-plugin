import React from 'react'
import { withRouter } from 'react-router-dom'
import AddTenantForm from './AddTenantForm'
import { ADD_TENANT, GET_TENANTS } from './actions'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddTenantPage extends React.Component {
  handleSubmit = tenant => {
    const { client, history } = this.props
    try {
      client.mutate({
        mutation: ADD_TENANT,
        variables: {
          input: tenant
        },
        update: (proxy, { data: { createTenant } }) => {
          const data = proxy.readQuery({ query: GET_TENANTS })
          data.tenants.push(createTenant)
          proxy.writeQuery({ query: GET_TENANTS, data })
        }
      })
      history.push('/ui/openstack/tenants')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <div>
        <h1>Add Users Page</h1>
        <AddTenantForm onSubmit={this.handleSubmit} />
      </div>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo,
)(AddTenantPage)
