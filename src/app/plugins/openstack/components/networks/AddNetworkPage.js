import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import AddNetworkForm from './AddNetworkForm'
import { ADD_NETWORK, GET_NETWORKS } from './actions'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddNetworkPage extends React.Component {
  handleSubmit = network => {
    const { client, history } = this.props
    try {
      client.mutate({
        mutation: ADD_NETWORK,
        variables: {
          input: network
        },
        update: (proxy, { data: { createNetwork } }) => {
          const data = proxy.readQuery({ query: GET_NETWORKS })
          data.networks.push(createNetwork)
          proxy.writeQuery({ query: GET_NETWORKS, data })
        }
      })
      history.push('/ui/openstack/networks')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <FormWrapper title="Add Network" backUrl="/ui/openstack/networks">
        <AddNetworkForm onSubmit={this.handleSubmit} />
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo,
)(AddNetworkPage)
