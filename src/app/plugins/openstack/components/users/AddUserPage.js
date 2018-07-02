import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddUserForm from './AddUserForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddUserPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add User" backUrl="/ui/openstack/users">
        <AddUserForm />
      </FormWrapper>
    )
  }
}

export default requiresAuthentication(AddUserPage)
