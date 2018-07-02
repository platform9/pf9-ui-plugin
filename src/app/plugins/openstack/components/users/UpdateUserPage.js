import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import UpdateUserForm from './UpdateUserForm'
import { GET_USER } from './actions'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateUserPage extends React.Component {
  componentDidMount () {
    const { client } = this.props
    const userId = this.props.match.params.userId

    client.query({
      query: GET_USER,
      variables: {
        id: userId
      }
    }).then((response) => {
      const user = response.data.user
      if (user) {
        this.setState({ user })
      }
    })
  }

  render () {
    const user = this.state && this.state.user

    return (
      <FormWrapper title="Update User" backUrl="/ui/openstack/users">
        { user &&
          <UpdateUserForm
            user={user}
            objId={this.props.match.params.userId}
          />
        }
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withApollo
)(UpdateUserPage)
