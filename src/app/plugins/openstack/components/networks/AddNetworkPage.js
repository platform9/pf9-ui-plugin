import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddNetworkForm from './AddNetworkForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddNetworkPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add Network" backUrl="/ui/openstack/networks">
        <AddNetworkForm />
      </FormWrapper>
    )
  }
}

export default requiresAuthentication(AddNetworkPage)
