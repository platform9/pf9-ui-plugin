import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddFloatingIpForm from './AddFloatingIpForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddFloatingIpPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add Floating IP" backUrl="/ui/openstack/floatingips">
        <AddFloatingIpForm />
      </FormWrapper>
    )
  }
}

export default requiresAuthentication(AddFloatingIpPage)
