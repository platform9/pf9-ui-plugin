import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import UpdateUserForm from './UpdateUserForm'
import { UPDATE_USER, GET_USER } from './actions'
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

  handleSubmit = user => {
    const { client, history } = this.props
    const userId = this.props.match.params.userId

    try {
      client.mutate({
        mutation: UPDATE_USER,
        variables: {
          id: userId,
          input: user
        },
      })
      history.push('/ui/openstack/users')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const user = this.state && this.state.user

    return (
      <FormWrapper title="Update User" backUrl="/ui/openstack/users">
        { user &&
          <UpdateUserForm onSubmit={this.handleSubmit} user={user} />
        }
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo
)(UpdateUserPage)
