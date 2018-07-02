import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddTenantForm from './AddTenantForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddTenantPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add Tenant" backUrl="/ui/openstack/tenants">
        <AddTenantForm />
      </FormWrapper>
    )
  }
}

export default requiresAuthentication(AddTenantPage)
