import React from 'react'
import { compose, withApollo } from 'react-apollo'
import { GET_NETWORK } from './actions'
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

  render () {
    const network = this.state && this.state.network

    return (
      <FormWrapper title="Update Network" backUrl="/ui/openstack/networks">
        {network &&
          <UpdateNetworkForm
            network={network}
            objId={this.props.match.params.networkId}
          />
        }
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withApollo
)(UpdateNetworkPage)
