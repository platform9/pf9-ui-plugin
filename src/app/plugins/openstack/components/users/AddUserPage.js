import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import AddUserForm from './AddUserForm'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddUserPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add User" backUrl="/ui/openstack/users">
        <AddUserForm
          client={this.props.client}
          history={this.props.history}
        />
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo,
)(AddUserPage)
