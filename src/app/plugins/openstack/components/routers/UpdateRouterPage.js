import React from 'react'
import { Query } from 'react-apollo'
import { GET_ROUTER } from './actions'
import FormWrapper from 'core/common/FormWrapper'
import UpdateRouterForm from './UpdateRouterForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateRouterPage extends React.Component {
  render () {
    const id = this.props.match.params.routerId

    return (
      <Query query={GET_ROUTER} variables={{ id }}>
        {({ data }) =>
          <FormWrapper title="Update Router" backUrl="/ui/openstack/routers">
            {data && data.router &&
              <UpdateRouterForm
                router={data.router}
                objId={id}
              />
            }
          </FormWrapper>
        }
      </Query>
    )
  }
}

export default requiresAuthentication(UpdateRouterPage)
