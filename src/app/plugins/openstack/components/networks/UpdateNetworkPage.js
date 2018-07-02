import React from 'react'
import { Query } from 'react-apollo'
import { GET_NETWORK } from './actions'
import FormWrapper from 'core/common/FormWrapper'
import UpdateNetworkForm from './UpdateNetworkForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateNetworkPage extends React.Component {
  render () {
    const id = this.props.match.params.networkId

    return (
      <Query query={GET_NETWORK} variables={{ id }}>
        {({ data }) =>
          <FormWrapper title="Update Network" backUrl="/ui/openstack/networks">
            {data && data.network &&
              <UpdateNetworkForm
                network={data.network}
                objId={id}
              />
            }
          </FormWrapper>
        }
      </Query>
    )
  }
}

export default requiresAuthentication(UpdateNetworkPage)
