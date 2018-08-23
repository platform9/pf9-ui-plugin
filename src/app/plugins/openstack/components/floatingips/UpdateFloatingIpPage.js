import React from 'react'
import { Query } from 'react-apollo'
import { GET_FLOATING_IP } from './actions'
import FormWrapper from 'core/common/FormWrapper'
import UpdateFloatingIpForm from './UpdateFloatingIpForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateFloatingIpPage extends React.Component {
  render () {
    const id = this.props.match.params.floatingIpId

    return (
      <Query query={GET_FLOATING_IP} variables={{ id }}>
        {({ data }) =>
          <FormWrapper title="Update Floating IP" backUrl="/ui/openstack/floatingips">
            {data && data.floatingIp &&
              <UpdateFloatingIpForm
                floatingIp={data.floatingIp}
                objId={id}
              />
            }
          </FormWrapper>
        }
      </Query>
    )
  }
}

export default requiresAuthentication(UpdateFloatingIpPage)
