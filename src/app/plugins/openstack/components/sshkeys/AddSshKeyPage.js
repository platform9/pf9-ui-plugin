import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddSshKeyForm from './AddSshKeyForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddSshKeyPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add SSH Key" backUrl="/ui/openstack/sshkeys">
        <AddSshKeyForm />
      </FormWrapper>
    )
  }
}

export default requiresAuthentication(AddSshKeyPage)
