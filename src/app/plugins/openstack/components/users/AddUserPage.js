import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import AddUserForm from './AddUserForm'
import { ADD_USER, GET_USERS } from './actions'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddUserPage extends React.Component {
  handleSubmit = user => {
    const { client, history } = this.props
    try {
      client.mutate({
        mutation: ADD_USER,
        variables: {
          input: user
        },
        update: (proxy, { data: { createUser } }) => {
          const data = proxy.readQuery({ query: GET_USERS })
          data.users.push(createUser)
          proxy.writeQuery({ query: GET_USERS, data })
        }
      })
      history.push('/ui/openstack/users')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <FormWrapper title="Add User" backUrl="/ui/openstack/users">
        <AddUserForm onSubmit={this.handleSubmit} />
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo,
)(AddUserPage)
