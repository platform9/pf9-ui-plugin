import React from 'react'
import { Query } from 'react-apollo'
import FormWrapper from 'core/common/FormWrapper'
import UpdateUserForm from './UpdateUserForm'
import { GET_USER } from './actions'
import { GET_TENANTS } from '../tenants/actions'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateUserPage extends React.Component {
  render () {
    const id = this.props.match.params.userId

    return (
      <Query query={GET_USER} variables={{ id }}>
        {({ data: { user } }) => (
          <Query query={GET_TENANTS}>
            {({ data: { tenants } }) =>
              <FormWrapper title="Update User" backUrl="/ui/openstack/users">
                { user && tenants &&
                  <UpdateUserForm
                    user={user}
                    tenants={tenants}
                    objId={id}
                  />
                }
              </FormWrapper>
            }
          </Query>
        )
        }
      </Query>
    )
  }
}

export default requiresAuthentication(UpdateUserPage)
