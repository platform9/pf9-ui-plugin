import React from 'react'
import { Query } from 'react-apollo'
import FormWrapper from 'core/common/FormWrapper'
import UpdateUserForm from './UpdateUserForm'
import { GET_USER } from './actions'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateUserPage extends React.Component {
  render () {
    const id = this.props.match.params.userId

    return (
      <Query query={GET_USER} variables={{ id }}>
        {({ data }) =>
          <FormWrapper title="Update User" backUrl="/ui/openstack/users">
            { data && data.user &&
              <UpdateUserForm
                user={data.user}
                objId={id}
              />
            }
          </FormWrapper>
        }
      </Query>
    )
  }
}

export default requiresAuthentication(UpdateUserPage)
