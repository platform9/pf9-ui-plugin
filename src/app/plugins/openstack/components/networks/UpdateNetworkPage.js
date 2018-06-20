import React from 'react'
import { withRouter } from 'react-router-dom'
import { compose, withApollo } from 'react-apollo'
import { GET_NETWORK, UPDATE_NETWORK } from './actions'
import FormWrapper from 'core/common/FormWrapper'
import UpdateNetworkForm from './UpdateNetworkForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateNetworkPage extends React.Component {
  componentDidMount () {
    const { client } = this.props
    const networkId = this.props.match.params.networkId

    client.query({
      query: GET_NETWORK,
      variables: {
        id: networkId
      }
    }).then((response) => {
      const network = response.data.network
      if (network) {
        this.setState({ network })
      }
    })
  }

  handleSubmit = network => {
    const { client, history } = this.props
    const networkId = this.props.match.params.networkId

    try {
      client.mutate({
        mutation: UPDATE_NETWORK,
        variables: {
          id: networkId,
          input: network
        }
      })
      history.push('/ui/openstack/networks')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const network = this.state && this.state.network

    return (
      <FormWrapper title="Update Network" backUrl="/ui/openstack/networks">
        {network &&
          <UpdateNetworkForm onSubmit={this.handleSubmit} network={network} />
        }
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo
)(UpdateNetworkPage)
